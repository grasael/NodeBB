// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call;
import * as plugins from '../plugins';
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call;
import * as db from '../database';

interface User {
    follow(uid: string, followuid: string): Promise<void>;
    unfollow(uid: string, unfollowuid: string): Promise<void>;
    getFollowing(uid: string, start: number, stop: number): Promise<User[]>; // Adjust the return type
    getFollowers(uid: string, start: number, stop: number): Promise<User[]>; // Adjust the return type
    isFollowing(uid: string, theirid: string): Promise<boolean>;
    exists(theiruid: string): Promise<boolean>; // Add the 'exists' method
    setUserField(uid: string, field: string, value: string): Promise<void>; // Add the 'setUserField' method
    getUsers(uids: string[], requesterUid: string): Promise<User[]>;
}

module.exports = function (user : User) {
    async function toggleFollow(type : string, uid : string, theiruid : string) {
        if (parseInt(uid, 10) <= 0 || parseInt(theiruid, 10) <= 0) {
            throw new Error('[[error:invalid-uid]]');
        }

        if (parseInt(uid, 10) === parseInt(theiruid, 10)) {
            throw new Error('[[error:you-cant-follow-yourself]]');
        }
        const exists = await user.exists(theiruid);
        if (!exists) {
            throw new Error('[[error:no-user]]');
        }
        const isFollowing = await user.isFollowing(uid, theiruid);
        if (type === 'follow') {
            if (isFollowing) {
                throw new Error('[[error:already-following]]');
            }
            const now = Date.now();
            await Promise.all([
                db.sortedSetAddBulk([
                    [`following:${uid}`, now, theiruid],
                    [`followers:${theiruid}`, now, uid],
                ]),
            ]);
        } else {
            if (!isFollowing) {
                throw new Error('[[error:not-following]]');
            }
            await Promise.all([
                db.sortedSetRemoveBulk([
                    [`following:${uid}`, theiruid],
                    [`followers:${theiruid}`, uid],
                ]),
            ]);
        }

        const [followingCount, followerCount] = await Promise.all([
            db.sortedSetCard(`following:${uid}`),
            db.sortedSetCard(`followers:${theiruid}`),
        ]);
        await Promise.all([
            user.setUserField(uid, 'followingCount', followingCount),
            user.setUserField(theiruid, 'followerCount', followerCount),
        ]);
    }

    async function getFollow(uid : string, type : string, start : number, stop : number) {
        if (parseInt(uid, 10) <= 0) {
            return [];
        }
        const uids = await db.getSortedSetRevRange(`${type}:${uid}`, start, stop);
        const data = await plugins.hooks.fire(`filter:user.${type}`, {
            uids: uids,
            uid: uid,
            start: start,
            stop: stop,
        });
        return await user.getUsers(data.uids, uid);
    }
    
    user.follow = async function (uid : string, followuid : string) {
        await toggleFollow('follow', uid, followuid);
    };

    user.unfollow = async function (uid : string, unfollowuid : string) {
        await toggleFollow('unfollow', uid, unfollowuid);
    };

    user.getFollowing = async function (uid : string, start : number, stop : number) {
        return await getFollow(uid, 'following', start, stop);
    };

    user.getFollowers = async function (uid : string, start : number, stop : number) {
        return await getFollow(uid, 'followers', start, stop);
    };

    user.isFollowing = async function (uid : string, theirid : string) {
        if (parseInt(uid, 10) <= 0 || parseInt(theirid, 10) <= 0) {
            return false;
        }
        return await db.isSortedSetMember(`following:${uid}`, theirid);
    };
};
