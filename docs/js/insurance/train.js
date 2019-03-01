// import * as tf from '@tensorflow/tfjs';
(async () => {
  const parser = d3.dsvFormat(';');

  // step 1: load and pre-process data
  const r = await fetch(
    'https://raw.githubusercontent.com/DJCordhose/deep-learning-crash-course-notebooks/master/data/insurance-customers-1500.csv'
  );
  const csv = await r.text();
  const data = await parser.parse(csv);

  const inputData = data.map((entry) => {
    return [
      Number(entry.age),
      Number(entry.speed),
      Number(entry.miles)
    ];
  });
  // does this look good?
  console.log(inputData[0]);

  // 0 - red: many accidents
  // 1 - green: few or no accidents
  // 2 - yellow: in the middle
  const groups = data.map((entry) => {
    return Number(entry.group);
  });

  // step 2: define a simple sequential model
  const model = tf.sequential();
  model.add(tf.layers.dense({ name: 'hidden1', units: 100, activation: 'relu', inputShape: [3] }));
  model.add(tf.layers.dense({ name: 'hidden2', units: 100, activation: 'relu' }));
  model.add(tf.layers.dense({ name: 'softmax', units: 3, activation: 'softmax' }));
  model.summary();

  model.compile({
    loss: 'categoricalCrossentropy',
    optimizer: 'adam',
    metrics: ['accuracy']
  });

  // step 3: train the model using our data
  const X = tf.tensor2d(inputData, [inputData.length, 3]);
  const y = tf.oneHot(tf.tensor1d(groups, 'int32'), 3);

  const history = await model.fit(X, y, {
    epochs: 50,
    validationSplit: 0.2,
    batchSize: 500,
    callbacks: {
      onEpochEnd: (...args) => {
        console.log(...args);
      },
      onEpochBegin: (iteration) => {
        // console.clear();
        // console.log(iteration);
      }
    }
  });

  // step 4: try out model and save it local browser storage
  const {acc, loss, val_acc, val_loss} = history.history;
  console.log(`acc: ${acc[acc.length -1]}, val_acc: ${val_acc[val_acc.length -1]}`);
  model.predict(tf.tensor([[48, 100, 10]])).print();

  // https://js.tensorflow.org/tutorials/model-save-load.html
  // will not work with a large model (even 500/500 layer size will be too much in chrome)
  // model.save('localstorage://insurance');
  model.save('indexeddb://insurance');
  console.log(await tf.io.listModels());
})();
