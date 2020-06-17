import { store } from 'react-notifications-component';

class Notify {

  static params = {
    insert: 'top',
    container: 'top-right',
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    dismiss: {
      duration: 5000,
      showIcon: true,
    },
  }

  static info = (title, message = ' ', duration = 5000, params = {}) => {
    console.log(this.params)
    store.addNotification({
      ...this.params,
      message,
      title,
      type: 'info',
      dismiss: {
        ...this.params.dismiss,
        duration,
      },
      ...params,
    });
  }

  static success = () => {

  }

  static warning = () => {

  }

  static error = () => {

  }

}

export default Notify;
