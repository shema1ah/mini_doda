import login from './api/login';
import home from './api/home';
import detail from './api/detail';
import profile from './api/profile';
import square from './api/square';
import post from './api/post';
import topic from './api/topic';
import focus from './api/focus';
import collect from './api/collect';
module.exports = {
  ...login,
  ...home,
  ...detail,
  ...profile,
  ...square,
  ...post,
  ...topic,
  ...focus,
  ...collect,
}