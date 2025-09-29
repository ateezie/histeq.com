// Debug carousel logic with 11 slides
console.log('=== Carousel Debug ===');

const slides = 11;
const breakpoints = {
  desktop: { minWidth: 1024, slidesPerView: 3 },
  tablet: { minWidth: 768, slidesPerView: 2 },
  mobile: { minWidth: 0, slidesPerView: 1 }
};

function getSlidesPerView(screenWidth) {
  if (screenWidth >= 1024) return 3;
  if (screenWidth >= 768) return 2;
  return 1;
}

function getTotalPages(slidesPerView) {
  return Math.ceil(slides / slidesPerView);
}

function calculateOffset(slideIndex, slideWidth, slidesPerView) {
  return -slideIndex * slideWidth * slidesPerView;
}

// Test different screen sizes
const testSizes = [375, 768, 1024, 1440];

testSizes.forEach(width => {
  const slidesPerView = getSlidesPerView(width);
  const totalPages = getTotalPages(slidesPerView);

  console.log(`\n--- Screen width: ${width}px ---`);
  console.log(`Slides per view: ${slidesPerView}`);
  console.log(`Total pages: ${totalPages}`);

  // Simulate slide width based on container width
  const containerWidth = width * 0.8; // Assume 80% of screen width
  const slideWidth = containerWidth / slidesPerView;

  console.log(`Container width: ${containerWidth}px`);
  console.log(`Slide width: ${slideWidth}px`);

  for (let page = 0; page < totalPages; page++) {
    const offset = calculateOffset(page, slideWidth, slidesPerView);
    const startSlide = page * slidesPerView;
    const endSlide = Math.min(startSlide + slidesPerView - 1, slides - 1);

    console.log(`Page ${page}: Shows slides ${startSlide}-${endSlide}, offset: ${offset}px`);
  }
});