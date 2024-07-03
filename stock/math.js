// 定义函数生成每个分段的曲线
function generateExponentialCurve(startX, endX, startY, endY, curvature) {
  // 定义曲线的参数
  let a =
    (startY - endY) /
    (Math.exp(curvature * startX) - Math.exp(curvature * endX));
  let b = startY - a * Math.exp(curvature * startX);

  // 返回曲线函数
  return function (x) {
    return a * Math.exp(curvature * x) + b;
  };
}

// 定义曲线的分段，使用levelRate和curvature
const segments = [
  { levelRate: 0.1, curvature: 0.1 },
  { levelRate: 0.2, curvature: 3 },
  { levelRate: 0.3, curvature: 5 },
  { levelRate: 0.4, curvature: 10 },
  { levelRate: 0.5, curvature: 30 },
  { levelRate: 1, curvature: 100 },
];

// 生成分段曲线函数
const segmentFunctions = [];
let previousEndY = 1;
let previousEndX = 0;

segments.forEach((segment) => {
  let startX = previousEndX;
  let endX = segment.levelRate;
  let startY = previousEndY;
  let endY = startY * Math.exp(-segment.curvature * (endX - startX));

  segmentFunctions.push(
    generateExponentialCurve(startX, endX, startY, endY, segment.curvature)
  );

  // 更新previousEndY和previousEndX
  previousEndY = endY;
  previousEndX = endX;
});

// 根据曲线档位确定曲线范围并计算调整后的比例
function calculateAdjustment(exceededRatio) {
  // 确定曲线档位的范围
  const level = segments.findIndex(
    (segment) => exceededRatio <= segment.levelRate
  );
  const segmentFunction = segmentFunctions[level];

  if (
    exceededRatio >= (level === 0 ? 0 : segments[level - 1].levelRate) &&
    exceededRatio <= segments[level].levelRate
  ) {
    return segmentFunction(exceededRatio);
  } else {
    throw new Error("Exceeded ratio is out of the current segment range");
  }
}

// 测试
const exceededRatio = 0.35;
const adjustment = calculateAdjustment(exceededRatio);
console.log(`exceededRatio: ${exceededRatio}, adjustment: ${adjustment}`);

// 生成超出库存比例数据
const x = Array.from({ length: 100 }, (_, i) => i / 100); // 计算调节系数
const y = x.map((ratio) => {
  return parseFloat(calculateAdjustment(ratio).toFixed(3));
});

console.info(x, "\n");
console.info(y, "\n");
