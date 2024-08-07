import numpy as np
import matplotlib.pyplot as plt

# New data arrays
x_new = np.array([
      0, 0.005,  0.01, 0.015,  0.02, 0.025,  0.03, 0.035,  0.04,
  0.045,  0.05, 0.055,  0.06, 0.065,  0.07, 0.075,  0.08, 0.085,
   0.09, 0.095,   0.1, 0.105,  0.11, 0.115,  0.12, 0.125,  0.13,
  0.135,  0.14, 0.145,  0.15, 0.155,  0.16, 0.165,  0.17, 0.175,
   0.18, 0.185,  0.19, 0.195,   0.2, 0.205,  0.21, 0.215,  0.22,
  0.225,  0.23, 0.235,  0.24, 0.245,  0.25, 0.255,  0.26, 0.265,
   0.27, 0.275,  0.28, 0.285,  0.29, 0.295,   0.3, 0.305,  0.31,
  0.315,  0.32, 0.325,  0.33, 0.335,  0.34, 0.345,  0.35, 0.355,
   0.36, 0.365,  0.37, 0.375,  0.38, 0.385,  0.39, 0.395,   0.4,
  0.405,  0.41, 0.415,  0.42, 0.425,  0.43, 0.435,  0.44, 0.445,
   0.45, 0.455,  0.46, 0.465,  0.47, 0.475,  0.48, 0.485,  0.49,
  0.495
] )

y_new = np.array([
      1, 0.997, 0.994, 0.991, 0.988, 0.985, 0.982, 0.978,
  0.975, 0.972, 0.969, 0.966, 0.962, 0.959, 0.956, 0.953,
  0.949, 0.946, 0.943,  0.94, 0.936, 0.933, 0.929, 0.926,
  0.923, 0.919, 0.916, 0.912, 0.909, 0.905, 0.902, 0.898,
  0.895, 0.891, 0.888, 0.884,  0.88, 0.877, 0.873, 0.869,
  0.866, 0.862, 0.858, 0.855, 0.851, 0.847, 0.843, 0.839,
  0.835, 0.832, 0.828, 0.824,  0.82, 0.816, 0.812, 0.808,
  0.804,   0.8, 0.796, 0.792, 0.788, 0.784,  0.78, 0.775,
  0.771, 0.767, 0.763, 0.759, 0.754,  0.75, 0.746, 0.742,
  0.737, 0.733, 0.728, 0.724,  0.72, 0.715, 0.711, 0.706,
  0.702, 0.697, 0.693, 0.688, 0.683, 0.679, 0.674, 0.669,
  0.665,  0.66, 0.655, 0.651, 0.646, 0.641, 0.636, 0.631,
  0.626, 0.621, 0.616, 0.612
])

# Plotting the curve
plt.figure(figsize=(10, 6))
plt.plot(x_new, y_new, label='Curve')
plt.xlabel('x')
plt.ylabel('y')
plt.title('Curve of x vs y')
plt.legend()
plt.grid(True)
plt.show()
