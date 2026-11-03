import { Week, Block, p, h, code, bash, plain, table, tip, warn, key, ul } from './types';
import { week1, week2 } from './weeks01';
import { week3, week4 } from './weeks03';
import { week5, week6 } from './weeks05';
import { week7, week8 } from './weeks07';
import { week9, week10 } from './weeks09';
import { week11, week12 } from './weeks11';

export const weeks: Week[] = [week1, week2, week3, week4, week5, week6, week7, week8, week9, week10, week11, week12];

export const totalLessons = weeks.reduce((a, w) => a + w.lessons.length, 0);

export const months = [
  { name: 'Month 1 · Foundations', weeks: [1, 2, 3, 4], color: 'from-cyan-400 to-blue-500' },
  { name: 'Month 2 · Machine Learning', weeks: [5, 6, 7, 8], color: 'from-violet-400 to-fuchsia-500' },
  { name: 'Month 3 · Professional', weeks: [9, 10, 11, 12], color: 'from-amber-400 to-rose-500' },
];

export const guide: { id: string; title: string; icon: string; blocks: Block[] }[] = [
  {
    id: 'how',
    title: 'How to Use This Book',
    icon: '📖',
    blocks: [
      p('**Author\'s note:** This is your single guide for the next 3 months. Follow it in order. Do not skip the practicals. Data science is learned by doing, not by reading.'),
      p('**Time plan:** 6 days per week, about 2 hours per day. Day 7 is rest and revision.'),
      table(['Part of the day', 'Time', 'What to do'], [
        ['Read', '30 min', 'Read the day\'s section. Type every example yourself. Never copy-paste.'],
        ['Practice', '60 min', 'Do the practicals and exercises.'],
        ['Review', '30 min', 'Write 3 lines in your notes: what I learned, what confused me, what I will fix tomorrow.'],
      ]),
      h('Golden rules'),
      ul('Type the code. Break it on purpose. Fix it.', 'Every week ends with a **Mini Project**. Push it to GitHub.', 'If you are stuck for more than 30 minutes, write the question down, move on, and come back.', 'Always ask: *What is the question? What is the data? What is the answer I can trust?*'),
      h('After 12 weeks you will be able to'),
      ul('Clean messy data and explore it with confidence', 'Query databases with SQL', 'Use statistics to make correct decisions', 'Build, evaluate, and tune machine learning models', 'Build a basic neural network', 'Deploy a model as a web app or API', 'Track experiments and keep work reproducible', 'Present results to non-technical people', 'Show 5 projects on GitHub and answer common interview questions'),
      warn('Honest note: Twelve weeks gives you a strong, job-ready foundation. "Expert" level needs more months of real projects. After this book, keep building projects and reading papers.'),
    ],
  },
  {
    id: 'setup',
    title: 'Setup (Day 1)',
    icon: '⚙️',
    blocks: [
      p('You already use Ubuntu, VS Code, and Git. Good. Set up a clean environment.'),
      bash`
# 1. Create a project folder
mkdir -p ~/ds-journey && cd ~/ds-journey

# 2. Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install the main libraries
pip install --upgrade pip
pip install numpy pandas matplotlib seaborn scipy statsmodels \
            scikit-learn jupyterlab plotly xgboost lightgbm \
            imbalanced-learn joblib

# 4. Later chapters (install when needed)
# pip install torch torchvision          # Week 9
# pip install fastapi uvicorn streamlit  # Week 10
# pip install mlflow pytest              # Week 11

# 5. Start Jupyter
jupyter lab`,
      h('Folder structure for every project'),
      plain`
project-name/
├── data/            # raw and cleaned data
├── notebooks/       # exploration
├── src/             # reusable .py code
├── models/          # saved models
├── reports/         # charts, final report
├── requirements.txt
└── README.md`,
      h('Check that everything works'),
      code`
import numpy as np, pandas as pd, matplotlib, sklearn, scipy
print("NumPy", np.__version__)
print("Pandas", pd.__version__)
print("Scikit-learn", sklearn.__version__)
print("Setup is OK")`,
      h('Git habit: at the end of each day'),
      bash`
git add .
git commit -m "Week X Day Y: what I did"
git push`,
    ],
  },
  {
    id: 'workflow',
    title: 'The Data Science Workflow',
    icon: '🔁',
    blocks: [
      ul('**1. Ask the question.** What problem are we solving? How will we know it is solved?', '**2. Get the data.** Files, databases, APIs.', '**3. Clean the data.** Missing values, wrong types, duplicates, outliers.', '**4. Explore (EDA).** Charts, summaries, patterns.', '**5. Model.** Choose features and algorithms.', '**6. Evaluate.** Use the right metric on unseen data.', '**7. Deploy.** Make it usable.', '**8. Monitor and communicate.** Explain results simply. Watch for decay.'),
      tip('Most of your time (about 60 to 70 percent) goes to steps 2 to 4. That is normal.'),
    ],
  },
];

export const appendix: { id: string; title: string; icon: string; blocks: Block[] }[] = [
  {
    id: 'pandas',
    title: 'Pandas Cheat Sheet',
    icon: '🐼',
    blocks: [
      table(['Task', 'Code'], [
        ['Read / write', 'pd.read_csv(f), df.to_csv(f, index=False)'],
        ['First look', 'df.head(), df.info(), df.describe(), df.shape'],
        ['Missing', 'df.isna().sum(), df.fillna(v), df.dropna()'],
        ['Select', 'df["c"], df[["a","b"]], df.loc[rows, cols], df.iloc[i, j]'],
        ['Filter', 'df[(df.a > 5) & (df.b == "x")], df.query("a > 5")'],
        ['New column', 'df["c"] = df.a * df.b, np.where(cond, x, y)'],
        ['Group', 'df.groupby("k").agg(total=("v","sum"))'],
        ['Join', 'a.merge(b, on="k", how="left")'],
        ['Reshape', 'pivot_table, melt, pd.crosstab'],
        ['Dates', 'pd.to_datetime, .dt.year, .resample("ME")'],
        ['Strings', '.str.lower(), .str.contains(), .str.replace()'],
        ['Duplicates', 'df.duplicated(), df.drop_duplicates()'],
      ]),
    ],
  },
  {
    id: 'sk',
    title: 'Scikit-learn Recipe & Model Chooser',
    icon: '🧪',
    blocks: [
      code`
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2,
                                                    stratify=y, random_state=42)
pipe = Pipeline([("prep", preprocess), ("model", model)])
cross_val_score(pipe, X_train, y_train, cv=5, scoring="roc_auc")
pipe.fit(X_train, y_train)
pipe.score(X_test, y_test)          # final check, once`,
      h('Which model to try first'),
      table(['Problem', 'First try', 'Then'], [
        ['Regression on table', 'Linear / Ridge baseline', 'Random Forest, LightGBM'],
        ['Classification on table', 'Logistic baseline', 'Random Forest, LightGBM'],
        ['Text', 'TF-IDF + Logistic', 'Pre-trained transformer'],
        ['Images', 'Pre-trained CNN (transfer learning)', 'Fine-tuning'],
        ['Groups, no labels', 'K-Means', 'DBSCAN, hierarchical'],
        ['Time series', 'Seasonal naive', 'Lag features + GB, SARIMAX'],
      ]),
      h('Metric chooser'),
      table(['Situation', 'Metric'], [
        ['Regression, easy to explain', 'MAE'],
        ['Regression, big errors are costly', 'RMSE'],
        ['Balanced classes', 'Accuracy, F1'],
        ['Imbalanced, rare event', 'PR-AUC, recall, precision'],
        ['Ranking quality', 'ROC-AUC'],
        ['Forecasting', 'MAE, MAPE (careful with zeros)'],
      ]),
    ],
  },
  {
    id: 'mistakes',
    title: 'Common Mistakes (Read Monthly)',
    icon: '⚠️',
    blocks: [
      ul('Fitting scalers or encoders on all data before the split (leakage).', 'Tuning on the test set.', 'Using accuracy on imbalanced data.', 'Shuffling time series.', 'No baseline.', 'Reporting a single lucky split.', 'Forgetting to set seeds.', 'Treating correlation as causation.', 'Ignoring data quality.', 'Building a model before understanding the problem.'),
    ],
  },
  {
    id: 'glossary',
    title: 'Glossary (Simple English)',
    icon: '📚',
    blocks: [
      table(['Term', 'Meaning'], [
        ['Feature', 'An input column used to predict'],
        ['Target / label', 'The thing we want to predict'],
        ['Training set', 'Data the model learns from'],
        ['Test set', 'Data kept aside to check the final result'],
        ['Overfitting', 'Model memorized training data and fails on new data'],
        ['Underfitting', 'Model too simple to learn the pattern'],
        ['Hyperparameter', 'A setting you choose before training'],
        ['Cross-validation', 'Testing on several different splits'],
        ['Data leakage', 'Information from the test or future leaks into training'],
        ['Baseline', 'A simple model to beat'],
        ['Regularization', 'A penalty that keeps the model simple'],
        ['Epoch', 'One full pass over the training data'],
        ['Batch', 'A small group of samples processed together'],
        ['Drift', 'Real-world data changes after deployment'],
        ['Pipeline', 'A chain of steps run in order'],
        ['Embedding', 'A list of numbers that represents text, an image, or an item'],
      ]),
    ],
  },
  {
    id: 'resources',
    title: 'Free Resources',
    icon: '🔗',
    blocks: [
      ul('**Official docs:** pandas, scikit-learn, PyTorch (excellent tutorials)', '**Practice:** Kaggle Learn micro-courses and datasets, SQLBolt, LeetCode or StrataScratch (SQL)', '**Statistics:** StatQuest (video), Khan Academy', '**Math:** 3Blue1Brown (Linear Algebra, Calculus, Neural Networks)', '**Deep learning:** fast.ai course, PyTorch tutorials', '**Reading:** Hands-On Machine Learning with Scikit-Learn, Keras and PyTorch (Géron)'),
      key('Final words: Consistency is more important than talent. Two focused hours a day for 12 weeks will change your skills. Build, break, fix, publish. Good luck.'),
      warn('If you fall behind: do not skip the practicals. Cut the optional parts (t-SNE, recommender, SHAP) and extend by one week. Quality beats speed.'),
    ],
  },
];
