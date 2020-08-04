const login = require('./login');
const upload = require('./upload');

const action = async (context) => {
  if (!context.config.has('username') || !context.config.has('password')) {
    context.setProgress('Authorizing…');
    try {
      await login(context);
    } catch (error) {
      if (error.message === 'canceled') {
        context.setProgress('Authorization completed', 'completed');
        context.cancel();
      } else {
        console.error(error.message);
      }
      return;
    }
  }

  const filePath = await context.filePath();
  upload(context, filePath);
};

const kdrive = {
  title: 'Share to kDrive',
  formats: ['gif', 'mp4', 'webm', 'apng'],
  action,
  config: {
    path: {
      title: 'kDrive Path',
      description: 'Path where Files are stored on Infomaniak drive',
      type: 'string',
      default: '/',
      required: true,
    },
  },
};

exports.shareServices = [kdrive];
