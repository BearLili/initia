let baseStock = 100; //基准/原始库存
let currentStock = 105; //现有库存
let incrementStock = 10; // 新增库存

// 曲率对应关系
const powMap = [
  {
    levelRate: 0.1,
    powRate: 0,
  },
  {
    levelRate: 0.3,
    powRate: 3,
  },
  {
    levelRate: 0.7,
    powRate: 5,
  },
];

// 调节系数计算函数
function calculateAdjustmentFactor(exceededRatio, a = 1) {
  // Sort powMap by levelRate in ascending order
  powMap.sort((a, b) => a.levelRate - b.levelRate);

  // Find the first element where exceededRatio is less than or equal to levelRate
  const foundPowItem =
    powMap.find((item) => exceededRatio <= item.levelRate) || null;

  // Calculate adjustment factor
  let powRate = foundPowItem ? foundPowItem.powRate : 10;
  let adjustmentFactor =
    a * ((powRate && Math.pow(exceededRatio, powRate)) || 0);

  return parseFloat((1 - adjustmentFactor).toFixed(3));
}

// 超基准比例
const exceededStock = currentStock + incrementStock - baseStock;
const exceededRatio = exceededStock / baseStock;

//let y = calculateAdjustmentFactor(exceededRatio)

// 生成超出库存比例数据
const x = Array.from({ length: 100 }, (_, i) => i / 100);

// 计算调节系数
const y = x.map((ratio) => {
  return calculateAdjustmentFactor(ratio);
});

console.info(x, "\n");
console.info(y, "\n");
