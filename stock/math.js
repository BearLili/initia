// 定义函数生成每个分段的曲线
function generateExponentialCurve(startX, endX, startY, endY, curvature) {
  let a =
    (endY - startY) /
    (Math.exp(curvature * endX) - Math.exp(curvature * startX));
  let b = startY - a * Math.exp(curvature * startX);

  return function (x) {
    return a * Math.exp(curvature * x) + b;
  };
}

// 定义曲线的分段，使用startX, endX, startY, endY, and curvature
const segments = [
  { startX: 0, endX: 0.1, curvature: 0.1 },
  { startX: 0.1, endX: 0.5, curvature: 8 },
];

// 生成分段曲线函数
const segmentFunctions = [];
let previousEndY = 1;
segments.forEach((segment) => {
  let startY = previousEndY;
  let endY =
    startY * Math.exp(-segment.curvature * (segment.endX - segment.startX));

  segmentFunctions.push(
    generateExponentialCurve(
      segment.startX,
      segment.endX,
      startY,
      endY,
      segment.curvature
    )
  );

  // 更新previousEndY
  previousEndY = endY;
});

// 根据exceededRatio计算调整后的价格折扣比例
function calculateAdjustment(exceededRatio) {
  if (exceededRatio < 0 || exceededRatio > 0.5) {
    throw new Error("Exceeded ratio is out of range (0 to 0.5)");
  }

  for (let i = 0; i < segments.length; i++) {
    if (
      exceededRatio >= segments[i].startX &&
      exceededRatio <= segments[i].endX
    ) {
      return parseFloat(segmentFunctions[i](exceededRatio).toFixed(3));
    }
  }
  throw new Error("Unexpected error in calculating adjustment");
}

// 测试
const exceededRatios = Array.from({ length: 100 }, (_, i) => i / 200);
let x = [];
let y = [];

exceededRatios.forEach((exceededRatio) => {
  let adjustment = calculateAdjustment(exceededRatio)
  console.log(`exceededRatio: ${exceededRatio}, adjustment: ${adjustment}`);
});
