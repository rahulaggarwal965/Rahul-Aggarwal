(($) => {
  'use strict';

  function onMobileToggleClick(e) {
    const $this = $(this),
          $navigation = $('.mobile-nav');

    $this.toggleClass('is-open');
    $navigation.toggleClass('is-open');
  }

  const bindings = () => {
    $('.mobile-nav-toggle').on('click', onMobileToggleClick);
  };

  $(document).ready(() => {
    bindings();
  });
})(jQuery);
