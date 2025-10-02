$(document).ready(function() {
  // Flag to prevent scroll detection from overriding manual clicks
  var manualClickActive = false;
  var manualClickTimeout;
  
  // Load all sections with error handling
  const sections = [
    { id: "#header", file: "header.html" },
    { id: "#home", file: "home.html" },
    { id: "#experiences", file: "experiences.html" },
    { id: "#skills", file: "skills.html" },
    { id: "#projects", file: "projects.html" },
    { id: "#educations", file: "educations.html" },
    { id: "#publications", file: "publications.html" },
    { id: "#footer", file: "footer.html" }
  ];

  sections.forEach(function(section) {
    $(section.id).load(section.file, function(response, status, xhr) {
      if (status === "error") {
        $(section.id).html(`<div class="alert alert-warning">Failed to load ${section.file}</div>`);
      }
    });
  });

  // Navigation click handler with smooth scrolling
  $(document).on('click', 'a[href^="#"]', function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var targetId = this.getAttribute('href');
    
    // Close mobile navigation menu if it's open
    var navbarCollapse = $('#navbarResponsive');
    if (navbarCollapse.hasClass('show')) {
      navbarCollapse.collapse('hide');
    }
    
    $(this).blur();
    
    // Set flag to prevent scroll detection from overriding
    manualClickActive = true;
    clearTimeout(manualClickTimeout);
    
    // Immediately set active state for the clicked link
    $('.navbar-nav .nav-link').removeClass("active");
    $(this).addClass("active");
    
    // Reset the flag after scrolling is complete
    manualClickTimeout = setTimeout(function() {
      manualClickActive = false;
    }, 1000);
    
    // Scroll to target after content loads
    var scrollToTarget = function() {
      var target = document.querySelector(targetId);
      
      if (target) {
        var navbarHeight = $('.navbar').outerHeight() || 70;
        var targetPosition = target.offsetTop - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } else {
        setTimeout(scrollToTarget, 200);
      }
    };
    
    setTimeout(scrollToTarget, 300);
  });

  // Active class detection on scroll with debouncing
  var scrollTimeout;
  $(window).scroll(function() {
    if (manualClickActive) {
      return;
    }
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      var scrollPos = $(document).scrollTop();
      var windowHeight = $(window).height();
      var navbarHeight = $('.navbar').outerHeight() || 70;
      
      var currentActive = null;
      var sections = [];

      // Collect all sections with their positions
      $('.navbar-nav .nav-link').each(function() {
        var currLink = $(this);
        var targetId = currLink.attr("href");
        var refElement = $(targetId);
        
        if (refElement.length) {
          var sectionElement = refElement.find('section').first();
          var elementToCheck = sectionElement.length ? sectionElement : refElement;
          
          if (elementToCheck.length) {
            var elementTop = elementToCheck.offset().top;
            var elementBottom = elementTop + elementToCheck.outerHeight();

            sections.push({
              link: currLink,
              id: targetId,
              top: elementTop,
              bottom: elementBottom
            });
          }
        }
      });
      
      // Find the section that's most in view
      var bestMatch = null;
      var bestScore = -1;
      
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionTop = section.top - navbarHeight;
        var sectionBottom = section.bottom - navbarHeight;
        var sectionHeight = section.bottom - section.top;

        // Calculate visibility ratio
        var visibleTop = Math.max(scrollPos, sectionTop);
        var visibleBottom = Math.min(scrollPos + windowHeight, sectionBottom);
        var visibleHeight = Math.max(0, visibleBottom - visibleTop);
        var visibilityRatio = visibleHeight / sectionHeight;
        
        // Calculate distance from section center
        var sectionCenter = sectionTop + (sectionHeight / 2);
        var distanceFromCenter = Math.abs(scrollPos + (windowHeight / 2) - sectionCenter);
        var maxDistance = windowHeight;
        var distanceScore = 1 - (distanceFromCenter / maxDistance);

        // Combined score: visibility ratio + distance score
        var combinedScore = (visibilityRatio * 0.7) + (distanceScore * 0.3);

        if (combinedScore > bestScore) {
          bestScore = combinedScore;
          bestMatch = section.link;
        }
      }

      currentActive = bestMatch;

      // Fallback: find closest section by distance
      if (!currentActive || bestScore < 0.1) {
        var closestDistance = Infinity;
        for (var i = 0; i < sections.length; i++) {
          var section = sections[i];
          var sectionTop = section.top - navbarHeight;
          var distance = Math.abs(scrollPos - sectionTop);

          if (distance < closestDistance) {
            closestDistance = distance;
            currentActive = section.link;
          }
        }
      }

      // Update active state
      if (currentActive && currentActive.length) {
        $('.navbar-nav .nav-link').removeClass("active");
        currentActive.addClass("active");
      }
    }, 50);
  });
  
  // Reset manual click flag when user actually scrolls
  var actualScrollTimeout;
  $(window).scroll(function() {
    clearTimeout(actualScrollTimeout);
    actualScrollTimeout = setTimeout(function() {
      if (manualClickActive) {
        manualClickActive = false;
      }
    }, 200);
  });

  // Handle window resize
  $(window).resize(function() {
    $(window).trigger('scroll');
  });
  
  // Set initial active state
  setTimeout(function() {
    $('.navbar-nav .nav-link').removeClass("active");
    $('.navbar-nav .nav-link[href="#home"]').addClass("active");
    $(window).trigger('scroll');
  }, 1000);
});