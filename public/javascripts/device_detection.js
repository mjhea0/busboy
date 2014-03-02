var DeviceDetection = {

    isAndroid: function() {
        return (/android/ig).test(navigator.userAgent);
    },

    isIOS: function() {
        return (/(iPad|iPhone|iPod)/ig).test(navigator.userAgent);
    },

    isPhone: function() {
        return this.isAndroid() || this.isIOS();
    },

    isBrowser: function() {
        return !this.isAndroid() && !this.isIOS();
    }

};

// module.exports = DeviceDetection;