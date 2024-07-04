// 定义曲线的分段
const segments = [
  { startX: 0, endX: 0.25, curvature: 0.05 },
  { startX: 0.25, endX: 1, curvature: 8 },
];

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
  if (exceededRatio < 0 || exceededRatio > 1) {
    throw new Error("Exceeded ratio is out of range (0 to 1)");
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

// 检查交易对象是否已经超过库存阈值
function isExceedingThreshold(currentStock, transactionAmount, threshold) {
  return currentStock + transactionAmount > threshold;
}

// 处理超出阈值部分的库存
function handleExceedingStock(
  transactionAmount,
  baseStock,
  currentStock,
  threshold
) {
  let canTransStock = threshold - currentStock;
  let exceededRatio =
    (canTransStock + currentStock - baseStock) / (threshold - baseStock);
  let adjustment = calculateAdjustment(exceededRatio);

  console.log(
    `handleExceedingStock: Exceeded ratio: ${(exceededRatio * 100).toFixed(
      2
    )}%, adjustment: ${adjustment}`
  );
  return { transactionStock: canTransStock, priceAdjustRate: adjustment };
}

// 调节后的挂单价/调整系数
function adjustOrderPrice(
  transactionAmount,
  baseStock,
  currentStock,
  threshold
) {
  let exceededRatio =
    (transactionAmount + currentStock - baseStock) / (threshold - baseStock);
  let adjustment = calculateAdjustment(exceededRatio);

  console.log(
    `adjustOrderPrice: Exceeded ratio: ${(exceededRatio * 100).toFixed(
      2
    )}%, adjustment: ${adjustment}`
  );
  return { priceAdjustRate: adjustment };
}

// 处理预挂单
function processPreOrder(
  transactionAmount,
  baseStock,
  currentStock,
  threshold
) {
  let transactionStock = transactionAmount;
  let priceAdjustRate = 1;
  let needAdjust = transactionAmount + currentStock > baseStock;

  if (needAdjust) {
    if (isExceedingThreshold(currentStock, transactionAmount, threshold)) {
      let exceedInfo = handleExceedingStock(
        transactionAmount,
        baseStock,
        currentStock,
        threshold
      );
      transactionStock = exceedInfo.transactionStock;
      priceAdjustRate = exceedInfo.priceAdjustRate;
    } else {
      let adjustedInfo = adjustOrderPrice(
        transactionAmount,
        baseStock,
        currentStock,
        threshold
      );
      priceAdjustRate = adjustedInfo.priceAdjustRate;
    }
  }

  return { transactionStock, priceAdjustRate };
}

// 测试
const threshold = 2000; // 阈值库存（不能超过）
let currentStock = 1400; // 当前库存
let baseStock = 1000; // 基准库存
const transactionAmounts = [100, 200, 300, 500, 600, 700, 799, 800, 810]; // 新增库存

transactionAmounts.forEach((amount) => {
  let result = processPreOrder(amount, baseStock, currentStock, threshold);
  console.log(
    `Transaction amount: ${amount}, Transaction stock: ${result.transactionStock}, Price adjust rate: ${result.priceAdjustRate}`
  );
  // currentStock += result.transactionStock;
});

// 测试-曲线描点
// const exceededRatios = Array.from({ length: 100 }, (_, i) => i / 100);
// let x = [];
// let y = [];

// exceededRatios.forEach((exceededRatio) => {
//   let adjustment = calculateAdjustment(exceededRatio);
//   x.push(exceededRatio);
//   y.push(adjustment);
// });

// console.info("x = ", x, "\n");
// console.info("y = ", y, "\n");
