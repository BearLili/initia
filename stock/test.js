const math = require('mathjs');

// 定义函数生成每个分段的曲线
function generateExponentialCurve(startX, endX, startY, endY, curvature) {
    let a = (startY - endY) / (Math.exp(curvature * startX) - Math.exp(curvature * endX));
    let b = startY - a * Math.exp(curvature * startX);

    return function(x) {
        return a * Math.exp(curvature * x) + b;
    };
}

// 测试不同曲率的影响
function testCurvatures(curvatures, startX, endX) {
    const startY = 1;
    const endY = 0.1;

    curvatures.forEach(curvature => {
        const curve = generateExponentialCurve(startX, endX, startY, endY, curvature);
        console.log(`Curvature: ${curvature}`);
        for (let x = startX; x <= endX; x += 0.05) {
            console.log(`x: ${x.toFixed(2)}, y: ${curve(x).toFixed(4)}`);
        }
        console.log('-----------------------');
    });
}

// 定义不同的曲率值进行测试
const curvatures = [1, 5, 10, 20, 40];
testCurvatures(curvatures, 0, 1);