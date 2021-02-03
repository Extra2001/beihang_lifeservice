const config = require("../../config.js");

Component({
  properties: {
    list: {
      type: Array
    }
  },
  data: {
    campusList: config.common.campus,
    loaded: {}
  },
  methods: {
    imgLoaded: function (e) {
      this.data.loaded[e.currentTarget.dataset.index] = true;
      this.setData({ loaded: this.data.loaded });
    }
  }
})
