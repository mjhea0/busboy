var DeviceDetection = {

    isAndroid: function() {
        return (/android/ig).test(navigator.userAgent);
    },

    isIOS: function() {
        return (/(iPad|iPhone|iPod)/ig).test(navigator.userAgent);
    },

    isPhone: function() {
        return isAndroid() || isIOS();
    },

    isBrowser: function() {
        return !isAndroid() && !isIOS();
    }

};

module.exports = DeviceDetection;