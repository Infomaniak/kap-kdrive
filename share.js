const join = require('url-join');
const request = require('request');
const path = require('path');

const share = (context, filePath) => {
  const folder = context.config.get('path');
  const target = join((folder ? folder.replace(/\/?$/, '/') : '') + path.basename(filePath));
  const headers = { 'OCS-APIRequest': 'true' };
  const shareUrl = join(context.config.get('url'), '/ocs/v2.php/apps/files_sharing/api/v1/shares');
  const auth = { username: context.config.get('username'), password: context.config.get('password') };

  const shareOptions = {
    path: target,
    shareType: 3,
    permissions: 1,
  };

  context.setProgress('Getting link…');

  request({
    method: 'POST',
    uri: shareUrl,
    headers,
    auth,
    form: shareOptions,
  },
  (error, response, body) => {
    if (error) {
      console.error(error.message);
    }

    try {
      const matches = body.match(/<url>(.*)<\/url>/m);

      context.copyToClipboard(matches[1]);
      context.notify('kDrive uploaded, link copied to Clipboard');
      context.setProgress('Upload done and share link created…', 'completed');
    } catch (matchError) {
      context.notify(`Could not get share link: ${matchError.message}`);
    }
  });
};

module.exports = share;
