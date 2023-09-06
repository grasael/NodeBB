// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call;
import * as plugins from '../plugins';
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call;
import * as db from '../database';

module.exports = function (User) {
    User.follow = async function (uid : string, followuid : string) {
        await toggleFollow('follow', uid, followuid);
    };

    User.unfollow = async function (uid : string, unfollowuid : string) {
        await toggleFollow('unfollow', uid, unfollowuid);
    };

    async function toggleFollow(type : string, uid : string, theiruid : string) {
        if (parseInt(uid, 10) <= 0 || parseInt(theiruid, 10) <= 0) {
            throw new Error('[[error:invalid-uid]]');
        }

        if (parseInt(uid, 10) === parseInt(theiruid, 10)) {
            throw new Error('[[error:you-cant-follow-yourself]]');
        }
        const exists = await User.exists(theiruid);
        if (!exists) {
            throw new Error('[[error:no-user]]');
        }
        const isFollowing = await User.isFollowing(uid, theiruid);
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
            User.setUserField(uid, 'followingCount', followingCount),
            User.setUserField(theiruid, 'followerCount', followerCount),
        ]);
    }

    User.getFollowing = async function (uid : string, start : number, stop : number) {
        return await getFollow(uid, 'following', start, stop);
    };

    User.getFollowers = async function (uid : string, start : number, stop : number) {
        return await getFollow(uid, 'followers', start, stop);
    };

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
        return await User.getUsers(data.uids, uid);
    }

    User.isFollowing = async function (uid : string, theirid : string) {
        if (parseInt(uid, 10) <= 0 || parseInt(theirid, 10) <= 0) {
            return false;
        }
        return await db.isSortedSetMember(`following:${uid}`, theirid);
    };
};
