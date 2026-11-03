import { Week, p, h, code, bash, table, tip, warn, key, ul, lab, q } from './types';

export const week11: Week = {
  n: 11,
  title: 'MLOps, Tracking, A/B Testing, Communication',
  month: 'Month 3 · Professional',
  emoji: '📡',
  goal: 'Work like a professional: reproducible, tracked, tested, and understandable by others.',
  daily: [
    'Day 1: Reproducibility and project structure',
    'Day 2: Experiment tracking with MLflow',
    'Day 3: Data validation, testing, model monitoring',
    'Day 4: Experiment design and A/B testing in depth',
    'Day 5: Ethics, fairness, privacy',
    'Day 6: Communication and storytelling + Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w11-l1',
      title: '11.1 Reproducibility',
      blocks: [
        p('If you cannot rerun your work and get the same result, nobody can trust it.'),
        code`
import random, numpy as np
SEED = 42
random.seed(SEED); np.random.seed(SEED)
# Also pass random_state=SEED to sklearn splits and models

# config.py
CONFIG = {"seed": 42, "test_size": 0.2, "n_estimators": 300, "max_depth": 8}`,
        ul('Fixed random seeds', 'requirements.txt with pinned versions (pip freeze > requirements.txt)', 'Data versions noted (file name, date, source, hash)', 'Config in one place, not scattered in code', 'Small functions in src/, not 500-line notebooks', 'A README that lets a stranger run the project in 5 commands'),
        bash`
# Optional: DVC for data versioning
pip install dvc
dvc init && dvc add data/raw.csv && git add data/raw.csv.dvc .gitignore`,
      ],
    },
    {
      id: 'w11-l2',
      title: '11.2 Experiment Tracking with MLflow',
      blocks: [
        p('After 30 experiments, you will not remember which settings gave which score. MLflow records it.'),
        code`
import mlflow, mlflow.sklearn
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, f1_score
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, random_state=42)

mlflow.set_experiment("breast-cancer-rf")
for n_est in [50, 200]:
    for depth in [3, 8, None]:
        with mlflow.start_run():
            m = RandomForestClassifier(n_estimators=n_est, max_depth=depth, random_state=42)
            m.fit(X_tr, y_tr)
            proba = m.predict_proba(X_te)[:, 1]
            mlflow.log_params({"n_estimators": n_est, "max_depth": depth})
            mlflow.log_metric("auc", roc_auc_score(y_te, proba))
            mlflow.log_metric("f1", f1_score(y_te, m.predict(X_te)))
            mlflow.sklearn.log_model(m, "model")`,
        bash`mlflow ui     # open http://127.0.0.1:5000 and compare runs`,
      ],
    },
    {
      id: 'w11-l3',
      title: '11.3 Data Validation and Tests',
      blocks: [
        code`
import pandas as pd

def validate(df: pd.DataFrame) -> list[str]:
    problems = []
    required = {"age", "income", "plan"}
    if missing := required - set(df.columns):
        problems.append(f"Missing columns: {missing}")
        return problems
    if df["age"].lt(0).any() or df["age"].gt(120).any():
        problems.append("Age out of range")
    if df["income"].lt(0).any():
        problems.append("Negative income")
    if df.duplicated().mean() > 0.05:
        problems.append("More than 5% duplicate rows")
    if df["plan"].isna().mean() > 0.1:
        problems.append("Too many missing plans")
    return problems`,
        p('Run `validate` every time new data arrives. Bad data in, bad predictions out.'),
        tip('Tests worth writing: feature functions return the right shape, no NaN after preprocessing, predictions are within 0 to 1, and a fixed small input gives a known output.'),
      ],
    },
    {
      id: 'w11-l4',
      title: '11.4 Monitoring: Models Decay',
      blocks: [
        p('A model is trained on yesterday\'s world. When the world changes, it gets worse.'),
        ul('**Data drift:** the inputs change (new customer types, new prices).', '**Concept drift:** the relationship between inputs and the target changes.'),
        code`
from scipy import stats
import numpy as np

def drift_report(train_col, live_col, alpha=0.01):
    stat, p = stats.ks_2samp(train_col, live_col)
    return {"ks_stat": round(stat, 3), "p": round(p, 4), "drift": p < alpha}

rng = np.random.default_rng(0)
print(drift_report(rng.normal(50, 10, 2000), rng.normal(50, 10, 500)))   # no drift
print(drift_report(rng.normal(50, 10, 2000), rng.normal(58, 10, 500)))   # drift`,
        p('Track the real outcome when it arrives and compare to predictions. Retrain on a schedule or when drift is detected.'),
      ],
    },
    {
      id: 'w11-l5',
      title: '11.5 A/B Testing in Depth',
      blocks: [
        ul('**Hypothesis:** "The new checkout button will raise purchase rate."', '**Metric:** one primary metric (conversion rate), plus guardrail metrics (refunds, speed).', '**Sample size:** decide BEFORE starting.', '**Randomize:** users randomly get A or B.', '**Run the full time:** do not stop early because it "looks significant" (peeking inflates false positives).', '**Analyze:** test, effect size, confidence interval.'),
        code`
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize

# Baseline conversion 10%. We want to detect a rise to 12%.
effect = proportion_effectsize(0.12, 0.10)
n = NormalIndPower().solve_power(effect_size=effect, alpha=0.05, power=0.8, ratio=1)
print("Users needed per group:", int(np.ceil(n)))`,
      ],
    },
    {
      id: 'w11-l6',
      title: '11.6 Ethics, Fairness, Privacy',
      blocks: [
        ul('**Bias in data → bias in model.** Check performance across groups (gender, region, age), not just overall.', '**Do not use** sensitive attributes, or close proxies, in decisions that affect people\'s lives without strong review.', '**Privacy:** remove names, phone numbers, and IDs you do not need. Follow the law and the data owner\'s permission.', '**Explainability:** if the model decides about loans, health, or jobs, people deserve a reason.', '**Honesty:** report weaknesses, not only wins.'),
        code`
from sklearn.metrics import recall_score

def recall_by_group(y_true, y_pred, group):
    d = pd.DataFrame({"y": y_true, "p": y_pred, "g": group})
    return d.groupby("g").apply(lambda x: recall_score(x["y"], x["p"]))`,
      ],
    },
    {
      id: 'w11-l7',
      title: '11.7 Communication: The Skill That Gets You Hired',
      blocks: [
        h('The structure of a good one-page report'),
        ul('**Answer first:** "We can predict churn with 82% recall. Targeting the top 20% saves about X."', '**Why it matters:** the business problem in one sentence.', '**Evidence:** 2 to 3 simple charts.', '**Risks and limits:** what the model cannot do.', '**Recommendation and next step.**'),
        key('Translate metrics: "RMSE 340" → "we are usually off by about 340 BDT per day". One chart, one message. No jargon with non-technical readers. Show uncertainty honestly.'),
        h('Experiment: spot the false alarm'),
        p('Bayes in action again — a reminder that a "positive" result needs context:'),
        lab('bayes'),
        warn('Never stop an A/B test the moment it looks significant.'),
        table(['Bad sentence', 'Better sentence'], [
          ['RMSE is 340', 'We are usually off by about 340 BDT per day'],
          ['p < 0.05', 'The difference is unlikely to be luck'],
          ['AUC is 0.82', 'The model ranks risky customers above safe ones 82% of the time'],
        ]),
      ],
    },
  ],
  exercises: [
    'Take your Week 7 project. Add a config file, fixed seeds, and a pinned requirements file. Ask a friend to run it.',
    'Track 15 experiments in MLflow and write which hyperparameter mattered most.',
    'Simulate drift: train on data with mean 50, score data with mean 60, and measure the drop in AUC.',
    'Write a one-page report of one past mini project for a non-technical manager.',
  ],
  project: {
    title: 'Mini Project 11: Professionalize One Project',
    desc: 'Refactor your best project into a clean repository: src/, tests, config, MLflow tracking, data validation function, README with run instructions, and a one-page business report in reports/.',
  },
  checklist: [
    'My projects run from scratch with a few commands',
    'I track experiments instead of memorizing them',
    'I know about drift and fairness',
    'I can explain results to a non-technical person',
  ],
  quiz: [
    q('What is data drift?', ['The model file gets corrupted', 'The input data distribution changes after deployment', 'Labels are missing', 'Training takes longer'], 1, 'Live inputs no longer look like the training inputs.'),
    q('What does MLflow mainly help with?', ['Tracking parameters, metrics, and models across experiments', 'Building web apps', 'Cleaning data', 'Drawing charts'], 0, 'It logs runs so you can compare experiments.'),
    q('Why is "peeking" at an A/B test and stopping early a problem?', ['It inflates false positives', 'It costs money', 'It reduces randomization only', 'It is illegal'], 0, 'Repeated looks raise the chance of seeing a fake significant result.'),
    q('When should the A/B sample size be decided?', ['After seeing results', 'Before the test starts', 'Halfway through', 'Never'], 1, 'Use a power analysis beforehand.'),
    q('Best first line of a business report?', ['A long explanation of the algorithm', 'The answer / main result', 'The code', 'A list of libraries'], 1, 'Answer first, then evidence and risks.'),
    q('A fairness check should compare…', ['Only overall accuracy', 'Metrics across groups like gender, region, age', 'Training time', 'Number of features'], 1, 'Overall numbers can hide poor performance on a group.'),
  ],
};

export const week12: Week = {
  n: 12,
  title: 'Capstone, Portfolio, Interview Prep',
  month: 'Month 3 · Professional',
  emoji: '🏆',
  goal: 'Prove your skills with one serious end-to-end project and prepare for jobs or research.',
  daily: [
    'Day 1: Choose the problem, define success, collect data',
    'Day 2: Clean + EDA',
    'Day 3: Baselines and models',
    'Day 4: Tuning, evaluation, interpretation',
    'Day 5: Deploy + document',
    'Day 6: Portfolio, CV, interview practice',
    'Day 7: Rest, review, plan the next 3 months',
  ],
  lessons: [
    {
      id: 'w12-l1',
      title: '12.1 Capstone Project Template',
      blocks: [
        p('Pick **one** problem that matters to you. Good choices:'),
        ul('**Retail:** sales forecasting + demand planning for a shop', '**Finance:** loan default or fraud detection', '**Health (public data only):** readmission or disease risk', '**Text:** Bangla news or review classification', '**Cybersecurity + DS:** network intrusion or phishing URL detection', '**Agriculture:** crop yield prediction from weather and soil data'),
        h('Capstone deliverables (every item is required)'),
        table(['#', 'Deliverable'], [
          ['1', 'Problem statement: who needs this, and what decision it supports'],
          ['2', 'Success metric and baseline'],
          ['3', 'Data description and source, cleaning log'],
          ['4', 'EDA with at least 8 charts and written insights'],
          ['5', 'Feature engineering with reasons'],
          ['6', 'At least 4 models, compared with cross-validation'],
          ['7', 'Tuning, final test score, error analysis'],
          ['8', 'Interpretation (feature importance or SHAP)'],
          ['9', 'Deployment: Streamlit app and/or FastAPI + Docker'],
          ['10', 'Tests, MLflow log, pinned requirements'],
          ['11', 'README with screenshots and a one-page business summary'],
          ['12', 'A 5-minute presentation or video'],
        ]),
        h('Project skeleton'),
        bash`
capstone/
├── data/raw/            # never edit raw data
├── data/processed/
├── notebooks/01_eda.ipynb, 02_modeling.ipynb
├── src/
│   ├── data.py          # load + validate + clean
│   ├── features.py
│   ├── train.py
│   └── predict.py
├── models/
├── tests/
├── app.py, api.py, Dockerfile
├── requirements.txt
└── README.md`,
      ],
    },
    {
      id: 'w12-l2',
      title: '12.2 Portfolio (Your Proof)',
      blocks: [
        p('You will have these 12 projects from this book. Choose the best 5 and polish them.'),
        table(['Week', 'Project'], [
          ['1', 'Shop sales tracker'], ['2', 'Shop sales analysis'], ['3', 'Clean and explore a real dataset'],
          ['4', 'SQL + statistics business questions'], ['5', 'Daily sales regression'], ['6', 'Churn classification'],
          ['7', 'Full pipeline project'], ['8', 'Segmentation / forecasting / sentiment'], ['9', 'Image classifier'],
          ['10', 'Deployed model'], ['11', 'Professionalized repo'], ['12', 'Capstone'],
        ]),
        h('What makes a portfolio project stand out'),
        ul('A real problem, not only a famous toy dataset (Titanic and MNIST alone are not enough)', 'A clear README: problem, approach, results, how to run', 'Honest evaluation: baseline, correct metric, limits', 'Deployed demo link', 'Clean code and commits'),
        tip('GitHub: pin 5 repositories, write a short bio, use a clear profile README. Also write 2–3 short blog posts. Kaggle: do 2 beginner competitions (Titanic, House Prices) then 1 current one, and read the top notebooks.'),
      ],
    },
    {
      id: 'w12-l3',
      title: '12.3 Interview Preparation',
      blocks: [
        h('Python and Pandas'),
        ul('Difference between a list and a tuple? A list and a NumPy array?', 'What is a lambda? A generator? A decorator?', 'How do you find duplicates and drop them in Pandas?', 'Difference between loc and iloc? merge, join and concat?', 'Dataset too big for memory? (chunks, usecols, dtypes, Parquet, Dask/Polars)'),
        h('SQL (write the queries on paper)'),
        ul('Second highest salary.', 'Customers with no orders.', 'Top 3 products in each category.', 'Month-over-month growth.', 'WHERE vs HAVING; INNER vs LEFT JOIN; UNION vs UNION ALL.'),
        h('Statistics'),
        ul('Explain p-value, confidence interval, Type I and II errors.', 'What is the Central Limit Theorem and why does it matter?', 'Correlation vs causation.', 'How would you design an A/B test and decide the sample size?', 'A test is 95% accurate and a disease affects 1% of people. What does a positive mean? (Bayes)'),
        h('Machine learning'),
        ul('Bias vs variance. How to detect and fix overfitting?', 'How does a Random Forest work? How does gradient boosting differ?', 'Precision vs recall. When do you prefer each?', 'Imbalanced data? Missing data? High-cardinality categories?', 'What is data leakage? Give an example.', 'Regularization: L1 vs L2?', 'Explain gradient descent. What if the learning rate is too high?', 'Why scale features, and for which models?', 'How would you explain a prediction to a customer?'),
        h('System and practical'),
        ul('How would you deploy a model? How would you monitor it?', 'Accuracy dropped in production. What do you check? (drift, data pipeline, label delay, bug)', 'Walk me through your best project: problem → data → approach → result → what I would improve.'),
        h('Case question method'),
        ul('Clarify the goal and the decision it supports.', 'Define the target and metric.', 'Describe the data you would need.', 'Describe features and a baseline.', 'Choose models, validate carefully (time-based split if needed).', 'Plan deployment, monitoring, and risks.'),
      ],
    },
    {
      id: 'w12-l4',
      title: '12.4–12.5 Resume Tips and What Next',
      blocks: [
        ul('One page. Lead with projects and results with numbers ("reduced forecast error by 18% over baseline").', 'Skills: Python, SQL, Pandas, scikit-learn, PyTorch, Git, Docker, Streamlit, FastAPI, MLflow.', 'Link to GitHub, portfolio demos, and LinkedIn.', 'Tailor it to each job description.'),
        h('What to learn after this book (months 4 to 12)'),
        table(['Area', 'Topics'], [
          ['Stronger math', 'Linear algebra, probability, optimization (deeper)'],
          ['Deep learning', 'Transformers, Hugging Face, fine-tuning, LLM applications'],
          ['Big data', 'Spark, Polars, cloud (AWS/GCP/Azure basics), data warehouses'],
          ['MLOps', 'CI/CD, Airflow or Prefect, feature stores, Kubernetes basics'],
          ['Specialty', 'NLP, computer vision, time series, recommender systems, causal inference'],
          ['Research', 'Read 1 paper per week, reproduce results, write about them'],
          ['Cybersecurity + DS', 'Anomaly detection, intrusion detection, malware classification, log analytics'],
        ]),
        key('Research-ready habit: pick one question that interests you, read the 5 most relevant papers, reproduce one, then try a small improvement. Write it up like a short paper.'),
        p('**Honest note:** twelve weeks gives you a strong, job-ready foundation. "Expert" level needs more months of real projects. Keep building and reading papers.'),
      ],
    },
  ],
  exercises: [
    'Write your capstone problem statement in 5 sentences, including the decision it supports.',
    'Complete all 12 capstone deliverables and tick them off one by one.',
    'Record a 5-minute presentation of your capstone.',
    'Pin your best 5 repositories on GitHub and write your profile README.',
    'Answer 10 interview questions out loud and time yourself.',
  ],
  project: {
    title: 'Mini Project 12: Capstone',
    desc: 'One serious end-to-end project: problem, data, cleaning, EDA, features, 4+ models with CV, tuning, interpretation, deployment (Streamlit/FastAPI + Docker), tests, MLflow, README, and a 5-minute presentation.',
  },
  checklist: [
    'My capstone has a baseline and an honest evaluation',
    'My capstone is deployed or has a demo',
    'I have 5 polished projects on GitHub',
    'I can walk through my best project in 3 minutes',
    'I have a plan for months 4 to 12',
  ],
  quiz: [
    q('What makes a portfolio project stand out most?', ['Using only famous toy datasets', 'A real problem with honest evaluation and a clear README', 'Using the most complex model', 'Having no documentation'], 1, 'Real problem + baseline + limits + demo.'),
    q('When asked "How would you predict X?", what comes first?', ['Pick an algorithm', 'Clarify the goal and the decision it supports', 'Start coding', 'Choose hyperparameters'], 1, 'Always start from the goal and decision.'),
    q('Model accuracy dropped in production. First thing to check?', ['Change the algorithm', 'Data drift, pipeline bugs, label delay', 'Add layers', 'Nothing'], 1, 'Investigate data and pipeline before changing the model.'),
    q('A resume should lead with…', ['Hobbies', 'Projects and results with numbers', 'A long skills list only', 'Photos'], 1, 'Quantified results prove skill.'),
    q('Raw data in a project should…', ['Be edited freely', 'Never be edited (keep processed copies elsewhere)', 'Be deleted', 'Be uploaded to the model'], 1, 'Keep data/raw untouched for reproducibility.'),
    q('For time-dependent problems, which validation is correct?', ['Random shuffle split', 'Time-based split', 'No validation', 'Use the test set to tune'], 1, 'Never train on the future to predict the past.'),
  ],
};
