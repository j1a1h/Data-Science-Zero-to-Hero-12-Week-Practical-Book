import { Week, p, h, code, table, tip, warn, key, ul, lab, q } from './types';

export const week5: Week = {
  n: 5,
  title: 'Math for ML, ML Basics, Regression',
  month: 'Month 2 · Machine Learning',
  emoji: '📈',
  goal: 'Understand how a machine learns, and build your first real models.',
  daily: [
    'Day 1: Math you need: vectors, matrices, derivatives, gradients',
    'Day 2: What is ML? Train/test split, overfitting',
    'Day 3: Linear regression (from scratch, then scikit-learn)',
    'Day 4: Regression metrics, residuals, assumptions',
    'Day 5: Regularization: Ridge and Lasso, polynomial features',
    'Day 6: Cross-validation + Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w5-l1',
      title: '5.1 Math You Really Need',
      blocks: [
        p('You do not need a math degree. You need these ideas.'),
        table(['Idea', 'Why it matters in ML'], [
          ['Vector and matrix', 'Data is stored as a matrix (rows = samples, columns = features)'],
          ['Dot product', 'Every linear model computes w · x + b'],
          ['Derivative', 'Tells us how a small change in a weight changes the error'],
          ['Gradient', 'The direction that increases error fastest. We go the opposite way'],
          ['Probability', 'Models output beliefs, not certainties'],
          ['Mean and variance', 'Measure spread and noise'],
        ]),
        code`
import numpy as np

# A prediction is a dot product
x = np.array([3.0, 5.0])        # features
w = np.array([0.4, 0.2])        # weights
b = 1.0
print("prediction:", x @ w + b)

# f(w) = (w - 3)^2  ->  f'(w) = 2(w - 3)
w = 10.0
lr = 0.1
for step in range(30):
    grad = 2 * (w - 3)
    w = w - lr * grad
print("w after descent:", round(w, 4))   # close to 3`,
        key('Gradient descent in one sentence: start with a guess, measure the error, move the weights a small step in the direction that lowers the error, repeat.'),
        h('Watch it learn'),
        p('Click on the curve to place the starting point, change the learning rate, and press Run. Try a learning rate above 1.0 and see it explode!'),
        lab('gradient'),
      ],
    },
    {
      id: 'w5-l2',
      title: '5.2 What Is Machine Learning?',
      blocks: [
        ul('**Supervised learning:** inputs X and known answers y. Regression: y is a number. Classification: y is a category.', '**Unsupervised learning:** no answers, find structure (customer groups).', '**Reinforcement learning:** learn by reward (games, robots).'),
        key('The golden rule: a model must be tested on data it has never seen. Otherwise you measure memory, not learning.'),
        code`
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split

data = load_diabetes(as_frame=True)
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)
print(X_train.shape, X_test.shape)`,
        ul('**Underfitting:** model too simple. Bad on train and test.', '**Overfitting:** model memorizes. Great on train, bad on test.', 'Goal: good on both. This balance is the **bias-variance trade-off**.'),
        lab('overfit'),
      ],
    },
    {
      id: 'w5-l3',
      title: '5.3 Linear Regression',
      blocks: [
        h('From scratch'),
        code`
rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 100)
y_s = 3 * x + 7 + rng.normal(0, 2, 100)      # true: slope 3, intercept 7

w, b, lr = 0.0, 0.0, 0.01
for epoch in range(2000):
    pred = w * x + b
    error = pred - y_s
    dw = 2 * (error * x).mean()
    db = 2 * error.mean()
    w -= lr * dw
    b -= lr * db
print(f"learned w={w:.2f}, b={b:.2f}")        # near 3 and 7`,
        h('With scikit-learn'),
        code`
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

model = LinearRegression()
model.fit(X_train, y_train)
pred = model.predict(X_test)

print("MAE :", mean_absolute_error(y_test, pred))
print("RMSE:", mean_squared_error(y_test, pred) ** 0.5)
print("R2  :", r2_score(y_test, pred))

coef = pd.Series(model.coef_, index=X.columns).sort_values()`,
      ],
    },
    {
      id: 'w5-l4',
      title: '5.4 Regression Metrics and Residuals',
      blocks: [
        table(['Metric', 'Meaning'], [
          ['MAE', 'Average absolute error, in the same unit as y. Easy to explain'],
          ['RMSE', 'Like MAE, but punishes big errors more'],
          ['R²', 'Share of variation explained. 1 is perfect, 0 is no better than the mean'],
        ]),
        code`
residuals = y_test - pred
fig, ax = plt.subplots(1, 3, figsize=(15, 4))
ax[0].scatter(y_test, pred, alpha=0.7)          # Actual vs Predicted
ax[1].scatter(pred, residuals, alpha=0.7)       # Residuals vs Predicted
ax[2].hist(residuals, bins=20)                  # Residual distribution`,
        tip('Always compare with a baseline. A model that predicts the mean for everyone is your baseline. If your model cannot beat it, it is not useful.'),
        code`
from sklearn.dummy import DummyRegressor
base = DummyRegressor(strategy="mean").fit(X_train, y_train)
print("Baseline RMSE:", mean_squared_error(y_test, base.predict(X_test)) ** 0.5)`,
      ],
    },
    {
      id: 'w5-l5',
      title: '5.5 Regularization and Polynomial Features',
      blocks: [
        ul('**Ridge (L2):** shrinks weights.', '**Lasso (L1):** can set weights to exactly zero, so it also selects features.'),
        code`
from sklearn.linear_model import Ridge, Lasso
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.pipeline import make_pipeline

for name, m in [("Ridge", Ridge(alpha=1.0)), ("Lasso", Lasso(alpha=0.1))]:
    pipe = make_pipeline(StandardScaler(), m).fit(X_train, y_train)
    print(name, "RMSE:", mean_squared_error(y_test, pipe.predict(X_test)) ** 0.5)

# Polynomial features capture curves
poly = make_pipeline(PolynomialFeatures(2), StandardScaler(), Ridge(alpha=10))
poly.fit(X_train, y_train)`,
      ],
    },
    {
      id: 'w5-l6',
      title: '5.6 Cross-Validation',
      blocks: [
        p('One train/test split can be lucky or unlucky. Cross-validation tests on several splits.'),
        code`
from sklearn.model_selection import cross_val_score, KFold

kf = KFold(n_splits=5, shuffle=True, random_state=42)
pipe = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
scores = cross_val_score(pipe, X, y, cv=kf, scoring="neg_root_mean_squared_error")
print("Mean RMSE:", round(-scores.mean(), 2), "+/-", round(scores.std(), 2))`,
        warn('Scale (and do any learning-based preprocessing) INSIDE a pipeline so it is fitted only on training data. Fitting a scaler on all data before splitting is data leakage — a very common mistake.'),
      ],
    },
  ],
  exercises: [
    'Implement gradient descent for linear regression with 2 features from scratch.',
    'Compare Linear, Ridge, and Lasso with 5-fold CV. Which wins and by how much?',
    'Plot train error and test error as polynomial degree goes from 1 to 10. Find where overfitting begins.',
    'Explain, in your own words, why we never tune a model on the test set.',
  ],
  project: {
    title: 'Mini Project 5: Predict Shop Daily Sales',
    desc: 'Use your shop sales data (or a public regression dataset like bike rentals or house prices). Build features such as weekday, month, and previous-day sales. Compare a baseline and three models. Report MAE in business terms ("on average we are off by 340 BDT per day").',
  },
  checklist: [
    'I can explain gradient descent',
    'I always split data before modeling and build a baseline',
    'I can read MAE, RMSE, R² and residual plots',
    'I know what data leakage is and use pipelines',
  ],
  quiz: [
    q('What does gradient descent do?', ['Randomly guesses weights', 'Moves weights in the direction that lowers the error', 'Sorts the data', 'Removes outliers'], 1, 'It repeatedly steps opposite to the gradient of the loss.'),
    q('If the learning rate is far too high, what typically happens?', ['Faster, perfect convergence', 'The loss oscillates or explodes', 'Nothing changes', 'The model underfits'], 1, 'Steps overshoot the minimum and the loss can diverge.'),
    q('A model is great on training data but poor on test data. This is…', ['Underfitting', 'Overfitting', 'Perfect fit', 'Data drift'], 1, 'Memorizing training data = overfitting.'),
    q('Which regularization can set weights exactly to zero?', ['Ridge (L2)', 'Lasso (L1)', 'Both always', 'Neither'], 1, 'Lasso (L1) produces sparse weights, so it selects features.'),
    q('R² = 0 means:', ['Perfect predictions', 'Model is no better than predicting the mean', 'Model is always wrong', 'No data'], 1, 'R² compares against the mean baseline.'),
    q('Why use a pipeline with cross-validation?', ['To make code shorter only', 'So preprocessing is fit on training folds only, avoiding leakage', 'To remove outliers', 'To speed up GPUs'], 1, 'Pipelines refit scalers/encoders inside each training fold.'),
  ],
};

export const week6: Week = {
  n: 6,
  title: 'Classification, Trees, Ensembles, Evaluation',
  month: 'Month 2 · Machine Learning',
  emoji: '🌳',
  goal: 'Predict categories, and learn to judge models honestly.',
  daily: [
    'Day 1: Logistic regression',
    'Day 2: Classification metrics: confusion matrix, precision, recall, F1, ROC-AUC',
    'Day 3: KNN, Naive Bayes, SVM',
    'Day 4: Decision trees and Random Forest',
    'Day 5: Gradient boosting: XGBoost, LightGBM',
    'Day 6: Model comparison + Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w6-l1',
      title: '6.1 Logistic Regression',
      blocks: [
        p('Despite the name, it predicts a **probability** for a class (0 to 1), using the sigmoid function.'),
        code`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression

data = load_breast_cancer(as_frame=True)
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)   # stratify keeps class ratio

clf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
clf.fit(X_train, y_train)

proba = clf.predict_proba(X_test)[:, 1]     # probability of class 1
pred = clf.predict(X_test)                  # default threshold 0.5`,
      ],
    },
    {
      id: 'w6-l2',
      title: '6.2 Classification Metrics',
      blocks: [
        warn('Accuracy alone can lie. If 99% of transactions are normal, a model that says "normal" always has 99% accuracy and catches zero fraud.'),
        table(['', 'Predicted Positive', 'Predicted Negative'], [
          ['Actually Positive', 'True Positive (TP)', 'False Negative (FN)'],
          ['Actually Negative', 'False Positive (FP)', 'True Negative (TN)'],
        ]),
        ul('**Precision** = TP / (TP + FP). When I say positive, how often am I right?', '**Recall** = TP / (TP + FN). Of all real positives, how many did I find?', '**F1** = balance of precision and recall.', '**ROC-AUC** = how well the model ranks positives above negatives (0.5 = random, 1 = perfect).'),
        tip('Which to favor? Cancer screening: recall. Spam filter: precision. Fraud: depends on the cost of each mistake.'),
        code`
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score

print(confusion_matrix(y_test, pred))
print(classification_report(y_test, pred))
print("ROC-AUC:", roc_auc_score(y_test, proba))

# Change the threshold to trade precision for recall
for t in [0.3, 0.5, 0.7]:
    p = (proba >= t).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, p).ravel()
    print(f"threshold {t}: precision={tp/(tp+fp):.3f} recall={tp/(tp+fn):.3f}")`,
        h('Interactive: move the threshold'),
        lab('threshold'),
      ],
    },
    {
      id: 'w6-l3',
      title: '6.3 KNN, Naive Bayes, SVM',
      blocks: [
        code`
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, f1_score

models = {
    "KNN": make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=7)),
    "NaiveBayes": GaussianNB(),
    "SVM": make_pipeline(StandardScaler(), SVC(kernel="rbf", probability=True)),
}
for name, m in models.items():
    m.fit(X_train, y_train)
    p = m.predict(X_test)
    print(f"{name:12s} acc={accuracy_score(y_test, p):.3f} f1={f1_score(y_test, p):.3f}")`,
        table(['Model', 'Idea', 'Needs scaling?'], [
          ['KNN', 'Look at the k nearest examples', 'Yes'],
          ['Naive Bayes', 'Bayes rule, assumes features independent', 'No'],
          ['SVM', 'Find the widest-margin boundary', 'Yes'],
        ]),
      ],
    },
    {
      id: 'w6-l4',
      title: '6.4 Decision Trees and Random Forest',
      blocks: [
        p('A decision tree asks a series of yes/no questions. Easy to explain, but one tree overfits.'),
        code`
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier

tree = DecisionTreeClassifier(max_depth=3, random_state=42).fit(X_train, y_train)
print(export_text(tree, feature_names=list(X.columns)))

# Random forest = many trees, each on random data and features, then vote
rf = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)
print("RF acc:", rf.score(X_test, y_test))

imp = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)`,
        tip('Trees need no scaling and handle non-linear patterns. Limit max_depth and min_samples_leaf to reduce overfitting.'),
      ],
    },
    {
      id: 'w6-l5',
      title: '6.5 Gradient Boosting',
      blocks: [
        p('Boosting builds trees one after another; each new tree fixes the errors of the previous ones. It is the top choice for most table data.'),
        code`
from sklearn.ensemble import HistGradientBoostingClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

gb = {
    "HistGB": HistGradientBoostingClassifier(random_state=42),
    "XGBoost": XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=3,
                             eval_metric="logloss", random_state=42),
    "LightGBM": LGBMClassifier(n_estimators=300, learning_rate=0.05,
                               random_state=42, verbose=-1),
}
for name, m in gb.items():
    m.fit(X_train, y_train)
    p = m.predict_proba(X_test)[:, 1]
    print(f"{name:9s} AUC={roc_auc_score(y_test, p):.4f}")`,
      ],
    },
    {
      id: 'w6-l6',
      title: '6.6–6.7 Compare Models Fairly + Multi-class',
      blocks: [
        code`
from sklearn.model_selection import StratifiedKFold, cross_validate

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
candidates = {
    "Logistic": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "RandomForest": RandomForestClassifier(n_estimators=200, random_state=42),
    "LightGBM": LGBMClassifier(n_estimators=200, random_state=42, verbose=-1),
}
rows = []
for name, m in candidates.items():
    r = cross_validate(m, X, y, cv=cv, scoring=["accuracy", "f1", "roc_auc"])
    rows.append({"model": name, "auc": r["test_roc_auc"].mean()})
print(pd.DataFrame(rows).sort_values("auc", ascending=False).round(4))`,
        tip('Do not pick a model only by the best number. Consider speed, size, explainability, and how stable the scores are across folds.'),
        code`
from sklearn.datasets import load_wine
Xw, yw = load_wine(return_X_y=True, as_frame=True)
Xw_tr, Xw_te, yw_tr, yw_te = train_test_split(Xw, yw, stratify=yw, random_state=0)
rf = RandomForestClassifier(random_state=0).fit(Xw_tr, yw_tr)
print(classification_report(yw_te, rf.predict(Xw_te)))
print(f1_score(yw_te, rf.predict(Xw_te), average="macro"))`,
      ],
    },
  ],
  exercises: [
    'Build the same classifier with 4 algorithms. Make a table with accuracy, precision, recall, F1, AUC.',
    'For logistic regression, find the threshold that gives recall of at least 0.98 and report the precision there.',
    'Compare max_depth from 1 to 15 for a decision tree. Plot train vs CV accuracy.',
    'Explain in 3 sentences why accuracy is a bad metric for rare events.',
  ],
  project: {
    title: 'Mini Project 6: Customer Churn Prediction',
    desc: 'Use a churn dataset (Kaggle, or create one from your shop data: "did the customer return within 30 days?"). Steps: split, baseline, 4 models, cross-validation, confusion matrix, feature importance, and a one-page business explanation.',
  },
  checklist: [
    'I choose metrics by the cost of mistakes',
    'I can explain precision, recall, and ROC-AUC',
    'I know how Random Forest and boosting work at a high level',
    'I compare models with cross-validation',
  ],
  quiz: [
    q('Precision answers which question?', ['Of all real positives, how many did I find?', 'When I say positive, how often am I right?', 'How many total predictions were right?', 'How fast is the model?'], 1, 'Precision = TP / (TP + FP).'),
    q('For cancer screening you most want to maximize…', ['Precision', 'Recall', 'Accuracy', 'Training speed'], 1, 'Missing a sick patient (false negative) is costly, so recall matters most.'),
    q('If you lower the classification threshold from 0.5 to 0.3, usually…', ['Recall goes up, precision goes down', 'Precision goes up, recall goes down', 'Both go up', 'Nothing changes'], 0, 'More samples are predicted positive: you catch more positives but with more false alarms.'),
    q('Which model needs feature scaling?', ['Decision tree', 'Random forest', 'KNN', 'Gradient boosting trees'], 2, 'KNN uses distances, so scale matters. Tree models do not need it.'),
    q('How does Random Forest differ from gradient boosting?', ['RF builds trees independently and votes; boosting builds trees sequentially to fix errors', 'RF uses one tree', 'Boosting uses no trees', 'No difference'], 0, 'Bagging (parallel) vs boosting (sequential).'),
    q('99% of transactions are normal. A model predicts "normal" always. Its accuracy is…', ['1%', '50%', '99% but useless', '0%'], 2, 'Accuracy hides that it catches zero fraud.'),
  ],
};
