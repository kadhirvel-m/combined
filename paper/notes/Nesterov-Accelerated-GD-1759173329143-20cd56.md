# Nesterov Accelerated GD

## Introduction
Optimization algorithms are fundamental to training machine learning models. **Gradient Descent (GD)** and its variants are widely used, especially for training neural networks in combination with backpropagation [GFG]. GD aims to minimize a **cost function** (also known as a **loss function**) by iteratively updating model parameters [GFG]. Among its advanced forms, **Nesterov Accelerated Gradient (NAG)** stands out as a variant of momentum-based gradient descent designed for faster convergence [GFG].

## TL;DR
*   **Gradient Descent (GD)** minimizes a cost function by moving in the direction of the negative gradient [GFG], [Scaler].
*   **Momentum Gradient Descent** enhances GD by incorporating a "momentum term" based on previous updates to accelerate convergence and reduce oscillations [GFG], [GFG].
*   **Nesterov Accelerated Gradient (NAG)** is an advanced form of momentum that calculates the gradient at a "predicted upcoming position" rather than the current position [GFG], [GFG].
*   This "look-ahead" mechanism allows NAG to achieve faster convergence rates compared to standard momentum [GFG], [GFG].
*   It's a **deterministic first-order algorithm**, meaning it follows a defined set of rules and uses only the first derivative (gradient) of the loss function [GFG].

## Understanding Gradient Descent
**Gradient Descent** is an optimization algorithm used to minimize functions by iteratively moving in the direction of the steepest descent, defined by the negative of the gradient [Scaler]. In machine learning, it updates a model's **weights (θ)** by taking small steps in the direction opposite to the gradient of the **loss function (J)** [GFG].

The general update rule for Gradient Descent is:
**θ = θ - α ⋅ ∇J(θ)** [GFG]
Where:
*   **θ** represents the parameters (weights and bias) of the model [GFG].
*   **α** (or **η**) is the **learning rate**, which determines the size of the step taken during each update [GFG].
*   **∇J(θ)** is the gradient of the loss function with respect to the parameters **θ**.

Gradient Descent is used to train various machine learning models:
*   **Linear Regression:** Minimizes the **Mean Squared Error (MSE)** loss function to find the best-fit line [GFG].
*   **Logistic Regression:** Minimizes the **Log Loss (Cross-Entropy Loss)** to optimize the decision boundary for binary classification [GFG].
*   **Support Vector Machines (SVMs):** Optimizes the **hinge loss** to ensure a maximum-margin hyperplane [GFG].

A simplified loss function for a single row can be written as **J(w, b) = (1/n) * (y_p - y)^2**, where **y_p** is the predicted value and **y** is the actual value [GFG].

## Momentum-based Gradient Descent
**Momentum** is a concept from physics where an object’s motion depends on both the current force and its previous velocity [GFG]. In gradient optimization, it refers to a method that accelerates convergence and reduces oscillations by incorporating a term based on previous updates [GFG], [GFG].

### Working of Momentum Gradient Descent
Momentum-based optimizers introduce a **velocity (v_t)** term that accumulates past gradients. The velocity is updated by considering both the previous velocity (representing momentum) and the current gradient [GFG]. The **momentum factor (γ or β)** controls the contribution of the previous velocity [GFG].

The update rules for Momentum Gradient Descent are:
1.  **Velocity Update:** **v_{t+1} = γv_t + η∇_θ J(θ)** [GFG]
2.  **Parameter Update:** **θ_{t+1} = θ_t - v_{t+1}** [GFG]

Here:
*   **v_t** is the velocity vector at time step *t*.
*   **γ** (gamma) is the **momentum factor** (typically between 0 and 1) [GFG].
*   **η** (eta) is the **learning rate** [GFG].
*   **∇_θ J(θ)** is the gradient of the loss function at the current parameters **θ**.

## Nesterov Accelerated Gradient (NAG)
**Nesterov Accelerated Gradient (NAG)** is an advanced form of momentum-based optimization. It modifies the update rule by calculating the gradient at an **upcoming position** rather than the current position of the weights [GFG]. This "look-ahead" mechanism allows NAG to achieve faster convergence rates [GFG].

### Working Principle of NAG
Unlike standard momentum, which calculates the gradient at the current parameters **θ_t** and then applies the accumulated velocity, NAG first makes a "predictive" step in the direction of the accumulated momentum. It then calculates the gradient at this predicted future position.

The update rules for Nesterov Accelerated Gradient are:
1.  **Velocity Update:** **v_{t+1} = γv_t + η∇_θ J(θ - γv_t)** [GFG]
2.  **Parameter Update:** **θ_{t+1} = θ_t - v_{t+1}** [GFG]

The key difference from standard momentum is in the gradient calculation: **∇_θ J(θ - γv_t)**. Instead of computing the gradient at **θ**, NAG computes it at **(θ - γv_t)**, which is the position the parameters *would be* if only the momentum term was applied. This allows NAG to "look ahead" and adjust its direction more effectively, especially in areas with varying gradients [GFG].

### Hyperparameters
*   **Learning Rate (η or α):** Determines the step size [GFG]. Crucial for convergence.
*   **Momentum Factor (γ or β):** Controls the contribution of previous velocity (momentum) [GFG].

## Types of First-Order Algorithms
First-order algorithms optimize models by minimizing loss functions, primarily using the first derivative (gradient) [GFG].

### Deterministic First-Order Algorithms
These algorithms follow a defined set of rules, ensuring reproducibility [GFG].
*   **Gradient Descent (GD):** Updates parameters in the direction of the negative gradient [GFG].
*   **Momentum Gradient Descent:** Enhances GD with a momentum term [GFG].
*   **Nesterov Accelerated Gradient Descent (NAG):** A variant of momentum GD with a different update rule for faster convergence [GFG].

### Stochastic First-Order Algorithms
These incorporate randomness, often from the data, useful for large datasets [GFG].
*   **Stochastic Gradient Descent (SGD):** Updates parameters based on a single training example [GFG].
*   **Mini-Batch Gradient Descent:** Updates parameters using a small batch of training examples [GFG].

### Adaptive Gradient Descent Methods
These methods adapt the learning rate for each parameter individually. While not strictly momentum-based in all cases, they are often mentioned alongside them as advanced optimizers.
*   **AdaGrad (Adaptive Gradient):** Adapts the learning rate per parameter, decreasing it more for parameters with larger past gradients [Scaler].
*   **Adadelta:** An extension of AdaGrad that reduces its aggressively decreasing learning rate [Scaler].
*   **RMSProp (Root Mean Square Propagation):** Adapts the learning rate per parameter, effective in dealing with non-stationary objectives [GFG].
*   **Adam (Adaptive Moment Estimation):** Combines concepts of both momentum and adaptive learning rates [needs review - not explicitly in sources but mentioned as "AdaMomentum" context].

## Examples
Nesterov Accelerated Gradient (NAG) is used in machine learning whenever **Gradient Descent** or **Momentum Gradient Descent** are applied, particularly in scenarios where faster convergence and better navigation of complex loss landscapes are desired.
*   **Training Neural Networks:** NAG can be employed as the optimizer to learn the **weights** and **biases** of neural network layers for tasks like image classification, natural language processing, and more [GFG].
*   **Linear and Logistic Regression:** While basic GD is often sufficient, NAG can be used for these models, especially with large datasets, to potentially speed up the process of finding optimal coefficients [GFG].
*   **Support Vector Machines (SVMs):** For training SVMs, NAG can help optimize the hinge loss and regularization terms more efficiently [GFG].

## Memory Aids
Think of NAG as a "foresighted climber" or "look-ahead car driver":
*   **Standard Momentum:** You're driving and decide to keep moving in the direction you're currently pointing, *plus* a bit of a push from how fast you were going before.
*   **NAG:** You briefly glance ahead in the direction your momentum is taking you, *then* you check the map (gradient) at that projected point, and *then* you adjust your steering and acceleration. This "look-ahead" helps avoid overshooting or getting stuck because you're planning a step ahead.

## Common Mistakes
*   **Incorrect Learning Rate (η):** A learning rate that is too high can cause the algorithm to overshoot the minimum and diverge; too low can lead to extremely slow convergence [GFG].
*   **Incorrect Momentum Factor (γ):** An overly high momentum factor might cause oscillations or overshoot, while a very low one might negate the benefits of momentum [GFG].
*   **Not Normalizing Data:** Unscaled features can lead to gradients of different magnitudes, making optimization harder for algorithms like NAG [needs review].
*   **Confusing Momentum and NAG:** While similar, mistaking the gradient calculation step (current position vs. look-ahead position) will lead to implementing standard momentum instead of NAG [GFG].

## Conclusion
Nesterov Accelerated Gradient (NAG) is a powerful optimization algorithm that builds upon the concept of momentum by incorporating a "look-ahead" mechanism. By calculating the gradient at a predicted future position, NAG can achieve faster convergence rates and more stable optimization paths compared to standard momentum. It is a valuable tool for efficiently training machine learning models, especially deep neural networks, by effectively navigating complex loss landscapes.

## Mermaid Diagram

```mermaid
graph TD
    A[Start Optimization] --> B{Initialize θ, v, η, γ};
    B --> C{Loop until Convergence};
    C --> D{Standard Momentum};
    D --> D1[Predict look-ahead position for gradient calculation];
    D1 --> D2[Calculate gradient at predicted position: ∇J(θ - γv)];
    D2 --> D3[Update velocity: v_new = γv_old + η * ∇J(θ - γv)];
    D3 --> D4[Update parameters: θ_new = θ - v_new];
    D4 --> C;
    C --> E[Nesterov Accelerated Gradient (NAG)];
    E --> E1[Calculate gradient at current position: ∇J(θ)];
    E1 --> E2[Update velocity: v_new = γv_old + η * ∇J(θ)];
    E2 --> E3[Update parameters: θ_new = θ - v_new];
    E3 --> C;

    subgraph Standard Momentum
        E1 --> E2 --> E3;
    end

    subgraph Nesterov Accelerated Gradient (NAG)
        D1 --> D2 --> D3 --> D4;
    end

    style D fill:#f9f,stroke:#333,stroke-width:2px;
    style E fill:#ccf,stroke:#333,stroke-width:2px;
    style D1 fill:#f9f,stroke:#333,stroke-width:2px;
    style D2 fill:#f9f,stroke:#333,stroke-width:2px;
    style D3 fill:#f9f,stroke:#333,stroke-width:2px;
    style D4 fill:#f9f,stroke:#333,stroke-width:2px;
    style E1 fill:#ccf,stroke:#333,stroke-width:2px;
    style E2 fill:#ccf,stroke:#333,stroke-width:2px;
    style E3 fill:#ccf,stroke:#333,stroke-width:2px;

    D -- "Standard Momentum: Gradient at current θ" --> E1;
    E -- "NAG: Gradient at look-ahead (θ - γv)" --> D1;

    linkStyle 3 stroke-width:0px,fill:none;
    linkStyle 4 stroke-width:0px,fill:none;
    linkStyle 5 stroke-width:0px,fill:none;
    linkStyle 6 stroke-width:0px,fill:none;
    linkStyle 7 stroke-width:0px,fill:none;
    linkStyle 8 stroke-width:0px,fill:none;
    linkStyle 9 stroke-width:0px,fill:none;
    linkStyle 10 stroke-width:0px,fill:none;
```
*(Note: The diagram illustrates the core difference in gradient calculation between Standard Momentum and Nesterov Accelerated Gradient. In the diagram, the flow for Standard Momentum is shown via E1, E2, E3, and for NAG via D1, D2, D3, D4.)*

## CITATIONS
*   [GFG] GeeksforGeeks, "Gradient Descent Algorithm in Machine Learning", URL: https://www.geeksforgeeks.org/machine-learning/gradient-descent-algorithm-and-its-variants/
    *   "Neural networks are trained using Gradient Descent (or its variants) in combination with backpropagation."
    *   "The algorithm minimizes a cost function, which quantifies the error or loss of the model's predictions compared to the true labels for:..."
    *   "Gradient descent minimizes the Mean Squared Error (MSE) which serves as the loss function to find the best-fit line. Gradient Descent is used to iteratively update the weights (coefficients) and bias…"
    *   "In logistic regression, gradient descent minimizes the Log Loss (Cross-Entropy Loss) to optimize the decision boundary for binary classification."
    *   "For SVMs, gradient descent optimizes the hinge loss, which ensures a maximum-margin hyperplane."
    *   "Define the loss function \text{Loss function (J)} =\frac{1}{n} \sum{(actual-predicted)^{2}} Here we are calculating the Mean Squared Error..."
    *   "For the sake of complexity, we can write our loss function for the single row as below J(w, b) = \frac{1}{n} (y_p-y)^2"
*   [GFG] GeeksforGeeks, "Momentum-based Gradient Optimizer - ML", URL: https://www.geeksforgeeks.org/machine-learning/ml-momentum-based-gradient-optimizer-introduction/
    *   "Before understanding momentum-based optimizers it’s important to understand the traditional gradient descent method."
    *   "Momentum is a concept from physics where an object’s motion depends not only on the current force but also on its previous velocity."
    *   "Learning Rate ( \eta ) : The learning rate determines the size of the step taken during each update."
    *   "Velocity Update : The velocity v_t ​ is updated by considering both the previous velocity which represents the momentum and the current gradient. The momentum factor \beta controls the contribution of…"
    *   "Nesterov momentum is an advanced form of momentum-based optimization. It modifies the update rule by calculating the gradient at the upcoming position rather than the current position of the weights."
    *   "RMSProp incorporates a form of momentum by adapting the learning rate for each parameter."
*   [GFG] GeeksforGeeks, "First-Order algorithms in machine learning", URL: https://www.geeksforgeeeks.org/machine-learning/first-order-algorithms-in-machine-learning/
    *   "First-order algorithms are integral to machine learning, particularly for optimizing models by minimizing loss functions."
    *   "Deterministic algorithms follow a well-defined set of rules to generate iterates, ensuring reproducibility and stability."
    *   "Gradient Descent (GD) is a fundamental first-order optimization algorithm that updates parameters in the direction of the negative gradient of the loss function. θ=θ−α⋅∇J(θ)"
    *   "Momentum Gradient Descent enhances the basic gradient descent by incorporating a momentum term to accelerate convergence and reduce oscillations. v_{t+1} =γv_t +η∇_θ J(θ) θ_{t+1}=θ_t −v_{t+1}"
    *   "Nesterov Accelerated Gradient Descent (NAG) is a variant of momentum gradient descent that uses a different momentum update rule to achieve faster convergence rates. v_{t+1} =γv_t +η∇_θ J(θ−γv_t) θ_{t+1}=θ_t −v_{t+1}"
    *   "Stochastic algorithms incorporate randomness in the iteration process... These algorithms are particularly useful for large datasets..."
    *   "SGD updates parameters based on a single example from the dataset..."
    *   "Mini-Batch Gradient Descent updates parameters using a small batch of training examples..."
*   [Scaler] Scaler Topics, "Adaptive Methods of Gradient Descent in Deep Learning", URL: https://www.scaler.com/topics/deep-learning/adagrad/
    *   "Gradient descent is an optimization algorithm used to minimize some functions by iteratively moving in the direction of the steepest descent as defined by the negative of the gradient."
    *   "AdaGrad (Adaptive Gradient) is a variant of the gradient descent algorithm that adapts the learning rate for each parameter individually."
    *   "Adadelta is an extension of Adagrad that reduces the aggressive, monotonically decreasing learning rate of Adagrad..."