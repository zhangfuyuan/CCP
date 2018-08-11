
export const myMixin = {
  created() {
  },
  methods: {
    showLoading(target, txt, isLock) {
      return this.$loading({
        text: txt || this.$t('common.processing'),
        target: target || '#appMain',
        lock: isLock || true,
      });
    },
  }
};
