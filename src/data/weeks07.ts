import { Week, p, h, code, table, tip, warn, key, ul, lab, q } from './types';

export const week7: Week = {
  n: 7,
  title: 'Feature Engineering, Pipelines, Tuning, Imbalanced Data',
  month: 'Month 2 · Machine Learning',
  emoji: '🛠️',
  goal: 'Do what separates good data scientists from beginners: build better inputs, build clean pipelines, and tune without cheating.',
  daily: [
    'Day 1: Encoding categories, scaling',
    'Day 2: Creating features: dates, text, ratios, aggregates',
    'Day 3: ColumnTransformer + Pipeline (the professional way)',
    'Day 4: Hyperparameter tuning',
    'Day 5: Imbalanced data',
    'Day 6: Feature selection, interpretation (SHAP), Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w7-l1',
      title: '7.1–7.2 Mixed Dataset, Encoding and Scaling',
      blocks: [
        code`
rng = np.random.default_rng(7)
n = 3000
df = pd.DataFrame({
    "age": rng.integers(18, 70, n),
    "income": rng.lognormal(10.5, 0.5, n).round(0),
    "city": rng.choice(["Dhaka", "Chittagong", "Sylhet", "Khulna"], n, p=[.5, .2, .15, .15]),
    "plan": rng.choice(["basic", "standard", "premium"], n, p=[.5, .3, .2]),
    "months_active": rng.integers(1, 60, n),
    "support_calls": rng.poisson(2, n),
})
# Hidden rule that creates the target
logit = (-2 + 0.35 * df["support_calls"] - 0.03 * df["months_active"]
         + (df["plan"] == "basic") * 0.8 + rng.normal(0, 0.5, n))
df["churned"] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)`,
        table(['Data type', 'Method'], [
          ['Categories with no order (city)', 'One-Hot Encoding'],
          ['Categories with order (basic < standard < premium)', 'Ordinal Encoding'],
          ['Many unique categories (1000 zip codes)', 'Target / frequency encoding, or tree models'],
          ['Numbers on different scales', 'StandardScaler (mean 0, std 1) or MinMaxScaler'],
          ['Skewed numbers (income)', 'Log transform'],
        ]),
        code`
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
print(ohe.fit_transform(df[["city"]])[:3], ohe.get_feature_names_out())

ordc = OrdinalEncoder(categories=[["basic", "standard", "premium"]])
print(ordc.fit_transform(df[["plan"]])[:5].ravel())

df["log_income"] = np.log1p(df["income"])`,
        warn('Scale with fitted statistics from the training data only. Never fit on the test set.'),
      ],
    },
    {
      id: 'w7-l2',
      title: '7.3 Feature Creation',
      blocks: [
        p('Good features often beat fancy models.'),
        code`
df["calls_per_month"] = df["support_calls"] / df["months_active"]
df["income_per_age"] = df["income"] / df["age"]
df["age_group"] = pd.cut(df["age"], [17, 25, 35, 50, 100],
                         labels=["18-25", "26-35", "36-50", "50+"])

# Aggregate features (very powerful with transaction data)
city_avg = df.groupby("city")["income"].transform("mean")
df["income_vs_city"] = df["income"] / city_avg

# Text features
from sklearn.feature_extraction.text import TfidfVectorizer
docs = ["good fast delivery", "bad late delivery", "good product good price"]
tf = TfidfVectorizer()
print(tf.fit_transform(docs).toarray().round(2), tf.get_feature_names_out())`,
        warn('Features computed using the target or future information cause leakage. Ask: "Would I know this at prediction time?"'),
      ],
    },
    {
      id: 'w7-l3',
      title: '7.4 ColumnTransformer + Pipeline',
      blocks: [
        p('This is how real projects are written. One object does everything, and is safe in cross-validation.'),
        code`
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score

features = ["age", "income", "city", "plan", "months_active",
            "support_calls", "calls_per_month"]
X, y = df[features], df["churned"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)

num_cols = ["age", "income", "months_active", "support_calls", "calls_per_month"]
preprocess = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                      ("sc", StandardScaler())]), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["city"]),
    ("ord", OrdinalEncoder(categories=[["basic", "standard", "premium"]]), ["plan"]),
])
model = Pipeline([
    ("prep", preprocess),
    ("clf", RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1)),
])
scores = cross_val_score(model, X_train, y_train, cv=5, scoring="roc_auc")
print("CV AUC:", scores.mean().round(4))
model.fit(X_train, y_train)`,
      ],
    },
    {
      id: 'w7-l4',
      title: '7.5 Hyperparameter Tuning',
      blocks: [
        p('Parameters are learned by the model. **Hyperparameters** (tree depth, learning rate) are set by you.'),
        code`
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from scipy.stats import randint, uniform

grid = GridSearchCV(
    model,
    param_grid={"clf__max_depth": [4, 8, None],
                "clf__min_samples_leaf": [1, 5, 10]},
    cv=5, scoring="roc_auc", n_jobs=-1)
grid.fit(X_train, y_train)
print(grid.best_params_, round(grid.best_score_, 4))

rand = RandomizedSearchCV(
    model,
    param_distributions={"clf__n_estimators": randint(100, 500),
                         "clf__max_depth": randint(3, 20),
                         "clf__max_features": uniform(0.3, 0.7)},
    n_iter=20, cv=5, scoring="roc_auc", random_state=42, n_jobs=-1)
rand.fit(X_train, y_train)

# Only now touch the test set, once
best = rand.best_estimator_
print("Test AUC:", roc_auc_score(y_test, best.predict_proba(X_test)[:, 1]))`,
        key('Process: train/validation (CV) for tuning → test set once at the end. If you keep adjusting after seeing test results, the test set is no longer honest.'),
      ],
    },
    {
      id: 'w7-l5',
      title: '7.6 Imbalanced Data',
      blocks: [
        code`
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, average_precision_score

Xi, yi = make_classification(n_samples=10000, weights=[0.97, 0.03],
                             n_informative=6, random_state=0)
Xi_tr, Xi_te, yi_tr, yi_te = train_test_split(Xi, yi, stratify=yi, random_state=0)

# Option 1: class weights (simple, often enough)
lr = LogisticRegression(class_weight="balanced", max_iter=1000).fit(Xi_tr, yi_tr)
print(classification_report(yi_te, lr.predict(Xi_te)))

# Option 2: SMOTE oversampling (inside an imblearn pipeline, training folds only)
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
pipe = ImbPipeline([("smote", SMOTE(random_state=0)),
                    ("clf", LogisticRegression(max_iter=1000))])
pipe.fit(Xi_tr, yi_tr)
print("PR-AUC:", average_precision_score(yi_te, pipe.predict_proba(Xi_te)[:, 1]))`,
        warn('For imbalanced data use PR-AUC, recall, precision, F1 — not accuracy. Also tune the decision threshold. Never apply SMOTE before the split.'),
      ],
    },
    {
      id: 'w7-l6',
      title: '7.7 Feature Selection and Interpretation',
      blocks: [
        code`
from sklearn.inspection import permutation_importance

result = permutation_importance(best, X_test, y_test, n_repeats=10,
                                random_state=42, scoring="roc_auc")
imp = pd.Series(result.importances_mean, index=X_test.columns).sort_values()
imp.plot.barh(title="Permutation importance")`,
        code`
# SHAP: explains each prediction (pip install shap)
# import shap
# explainer = shap.TreeExplainer(trained_tree_model)
# shap_values = explainer(X_test_transformed)
# shap.plots.beeswarm(shap_values)`,
        tip('Explain model results to humans: "Customers with many support calls and a basic plan are the most likely to leave."'),
        ul('Pipelines keep preprocessing honest.', 'Tune with CV, test once.', 'Pick metrics that match the cost of mistakes.'),
        p('Imbalanced data, once more — but with the threshold slider:'),
        lab('threshold'),
      ],
    },
  ],
  exercises: [
    'Add 5 new features to the churn data. Measure whether CV AUC improves. Keep only those that help.',
    'Compare One-Hot vs Ordinal encoding for plan with a linear model and a tree model.',
    'Tune LightGBM with RandomizedSearchCV (20 iterations). Report improvement over default.',
    'On the imbalanced data, compare: no fix, class weights, SMOTE. Use PR-AUC.',
    'Find one example where a feature leaks the target, and explain why.',
  ],
  project: {
    title: 'Mini Project 7: Complete Pipeline Project',
    desc: 'Build a pipeline for a tabular dataset (Kaggle: Titanic, House Prices, or Telco Churn). It must include imputation, encoding, scaling, feature creation, tuned model, CV, final test score, and permutation importance. Put the pipeline in src/train.py and save the model with joblib.dump.',
  },
  checklist: [
    'I use pipelines and never fit preprocessing on test data',
    'I know the right encoding for each type of column',
    'I tune with CV, test once',
    'I can handle imbalanced data with correct metrics',
  ],
  quiz: [
    q('Best encoding for "city" with no natural order?', ['Ordinal', 'One-Hot', 'Log transform', 'Min-Max'], 1, 'One-Hot avoids implying a false order.'),
    q('Which scenario is data leakage?', ['Fitting StandardScaler on all data before splitting', 'Using a pipeline', 'Using stratify', 'Setting a seed'], 0, 'Test-set information leaks into training statistics.'),
    q('Where should SMOTE be applied?', ['Before the train/test split', 'On the test set', 'Inside a pipeline, on training folds only', 'Never'], 2, 'Oversampling before splitting leaks synthetic copies into validation.'),
    q('Which metric is best for a 3% fraud rate?', ['Accuracy', 'PR-AUC / recall / precision', 'R²', 'MAE'], 1, 'Accuracy is dominated by the majority class.'),
    q('When should you evaluate on the test set?', ['After each tuning step', 'Once, at the very end', 'Never', 'Before training'], 1, 'Repeated use makes the test set a tuning set.'),
    q('Which is a hyperparameter?', ['The learned weights of a linear model', 'max_depth of a tree', 'The predictions', 'The test score'], 1, 'Hyperparameters are set by you before training.'),
  ],
};

export const week8: Week = {
  n: 8,
  title: 'Clustering, PCA, Time Series, NLP',
  month: 'Month 2 · Machine Learning',
  emoji: '🔮',
  goal: 'Learn the three big areas beyond standard table prediction: finding groups, forecasting over time, and working with text.',
  daily: [
    'Day 1: K-Means and clustering evaluation',
    'Day 2: Hierarchical clustering, DBSCAN, PCA, t-SNE',
    'Day 3: Time series basics and forecasting with ML',
    'Day 4: Classical forecasting: ARIMA idea',
    'Day 5: NLP: cleaning, TF-IDF, text classification',
    'Day 6: Recommender basics + Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w8-l1',
      title: '8.1 Clustering',
      blocks: [
        code`
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

rng = np.random.default_rng(5)
cust = pd.DataFrame({
    "annual_spend": np.r_[rng.normal(20000, 3000, 150), rng.normal(60000, 8000, 100), rng.normal(110000, 10000, 50)],
    "visits": np.r_[rng.normal(10, 3, 150), rng.normal(35, 6, 100), rng.normal(70, 8, 50)],
})
Xs = StandardScaler().fit_transform(cust)       # clustering needs scaling

# Choose k: elbow + silhouette
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Xs)
    print(k, km.inertia_, silhouette_score(Xs, km.labels_))

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(Xs)
cust["segment"] = km.labels_
print(cust.groupby("segment").mean().round(0))   # profile each segment`,
        tip('Always profile clusters (average of each feature per cluster) and give them business names, like "Occasional", "Regular", "VIP".'),
        h('Watch K-Means think'),
        p('Press Step to see points get assigned and centroids move. Try different k values.'),
        lab('kmeans'),
        code`
# DBSCAN: finds dense areas and marks noise as -1. No need to choose k.
db = DBSCAN(eps=0.4, min_samples=5).fit(Xs)
# Hierarchical
agg = AgglomerativeClustering(n_clusters=3).fit(Xs)`,
      ],
    },
    {
      id: 'w8-l2',
      title: '8.2 Dimensionality Reduction',
      blocks: [
        code`
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine
from sklearn.manifold import TSNE

Xw, yw = load_wine(return_X_y=True)
Xw = StandardScaler().fit_transform(Xw)

pca = PCA().fit(Xw)
print("Cumulative:", pca.explained_variance_ratio_.cumsum().round(3))

X2 = PCA(n_components=2).fit_transform(Xw)
X_tsne = TSNE(n_components=2, random_state=0, perplexity=30).fit_transform(Xw)`,
        p('PCA finds new axes that keep the most variance. Use it for visualization, speed, and noise reduction. **t-SNE is only for visualization**, never as model input.'),
      ],
    },
    {
      id: 'w8-l3',
      title: '8.3 Time Series',
      blocks: [
        warn('Time series data is ordered in time, so NEVER shuffle it, and never train on the future to predict the past.'),
        code`
idx = pd.date_range("2023-01-01", periods=730, freq="D")
trend = np.linspace(100, 160, 730)
weekly = 15 * np.sin(2 * np.pi * idx.dayofweek / 7)
yearly = 20 * np.sin(2 * np.pi * idx.dayofyear / 365)
sales = pd.Series(trend + weekly + yearly + rng.normal(0, 5, 730), index=idx)

from statsmodels.tsa.seasonal import seasonal_decompose
seasonal_decompose(sales, period=7).plot()

# Baselines (always compare to these)
train, test = sales[:-60], sales[-60:]
naive = pd.Series(train.iloc[-1], index=test.index)   # tomorrow = today
seasonal_naive = sales.shift(7)[-60:]                 # same weekday last week

def mae(a, b): return np.abs(a - b).mean()`,
        h('Forecasting with an ML model using lag features'),
        code`
d = sales.to_frame("sales")
for lag in [1, 7, 14]:
    d[f"lag_{lag}"] = d["sales"].shift(lag)
d["roll7"] = d["sales"].shift(1).rolling(7).mean()   # shift(1) avoids leakage
d["dow"] = d.index.dayofweek
d = d.dropna()

X, y = d.drop(columns="sales"), d["sales"]
split = len(d) - 60
gb = HistGradientBoostingRegressor(random_state=0).fit(X[:split], y[:split])
print("GB MAE:", mae(y[split:], gb.predict(X[split:])).round(2))

from statsmodels.tsa.statespace.sarimax import SARIMAX
model = SARIMAX(train, order=(1,1,1), seasonal_order=(1,0,1,7)).fit(disp=False)
fc = model.forecast(60)`,
      ],
    },
    {
      id: 'w8-l4',
      title: '8.4 NLP: Text Classification',
      blocks: [
        code`
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

def clean(t):
    t = t.lower()
    t = re.sub(r"[^a-z\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()

nlp = make_pipeline(TfidfVectorizer(ngram_range=(1, 2), stop_words="english"),
                    LogisticRegression(max_iter=1000))
nlp.fit(X_tr, y_tr)
print(nlp.predict([clean("really bad and slow"), clean("great and fast")]))

# Which words matter?
vec = nlp.named_steps["tfidfvectorizer"]
coef = nlp.named_steps["logisticregression"].coef_[0]
words = pd.Series(coef, index=vec.get_feature_names_out()).sort_values()`,
        key('NLP steps: clean → tokenize → vectorize (Bag-of-Words, TF-IDF, or embeddings) → model → evaluate.'),
        p('For **Bangla text**, the same pipeline works. Use a Bangla stop-word list and keep Bangla characters in your cleaning regex ([^\\u0980-\\u09FF\\s]). Pre-trained multilingual transformers give better results with more data.'),
      ],
    },
    {
      id: 'w8-l5',
      title: '8.5 Recommender System Basics',
      blocks: [
        code`
from sklearn.metrics.pairwise import cosine_similarity

# user x item rating matrix (0 = not rated)
ratings = pd.DataFrame(
    [[5, 4, 0, 1], [4, 5, 1, 0], [1, 0, 5, 4], [0, 1, 4, 5], [5, 0, 0, 2]],
    index=["u1", "u2", "u3", "u4", "u5"], columns=["A", "B", "C", "D"])

user_sim = pd.DataFrame(cosine_similarity(ratings), index=ratings.index, columns=ratings.index)

def recommend(user, k=2):
    sims = user_sim[user].drop(user)
    scores = (ratings.loc[sims.index].T @ sims) / sims.sum()
    already = ratings.loc[user] > 0
    return scores[~already].sort_values(ascending=False).head(k)

print(recommend("u5"))`,
        p('Two main styles: **content-based** (similar items) and **collaborative filtering** (similar users). Real systems mix both.'),
      ],
    },
  ],
  exercises: [
    'Segment 1000 shop customers using RFM (Recency, Frequency, Monetary). Name each segment.',
    'Apply PCA to a 30-feature dataset. How many components keep 95% of variance?',
    'Forecast the next 14 days of sales with seasonal naive, SARIMAX, and gradient boosting. Which is best?',
    'Build a spam classifier using TF-IDF + Logistic Regression and show the top 10 spam words.',
    'Build a "customers who bought X also bought Y" recommender from order data.',
  ],
  project: {
    title: 'Mini Project 8: Choose One',
    desc: 'A) Customer segmentation + a recommended action per segment. B) Sales forecasting with baseline vs ML, and an honest error report. C) Bangla or English sentiment classifier with a Streamlit demo (done in Week 10).',
  },
  checklist: [
    'I can pick k for K-Means and profile clusters',
    'I use PCA correctly (scale first)',
    'I never shuffle time series and I build lag features without leakage',
    'I can build a text classifier with TF-IDF',
  ],
  quiz: [
    q('Why scale data before K-Means?', ['It uses distances, so large-scale features dominate otherwise', 'It needs labels', 'To remove outliers', 'It is not needed'], 0, 'Distance-based methods are sensitive to feature scale.'),
    q('What does DBSCAN label noise points as?', ['0', '1', '-1', 'NaN'], 2, 'DBSCAN marks outliers with label -1.'),
    q('t-SNE should be used for…', ['Model input features', 'Visualization only', 'Forecasting', 'Scaling'], 1, 'The embedding is not stable or reusable for new data.'),
    q('Why use shift(1) before rolling mean in lag features?', ['To speed up', 'To avoid using today\'s value to predict today (leakage)', 'To fill NaN', 'To sort the data'], 1, 'The feature must only use past information.'),
    q('A seasonal-naive forecast for a weekly pattern predicts…', ['Tomorrow = today', 'Tomorrow = same weekday last week', 'The overall mean', 'Zero'], 1, 'It repeats the value from one season (7 days) ago.'),
    q('Order of NLP steps?', ['Model → clean → vectorize', 'Clean → tokenize → vectorize → model → evaluate', 'Vectorize → evaluate → clean', 'Evaluate → clean'], 1, 'Clean first, then convert text to numbers, then model.'),
  ],
};
