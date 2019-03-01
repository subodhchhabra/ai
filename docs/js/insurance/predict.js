(async () => {
  // const model = await tf.loadLayersModel('localstorage://insurance');
  const model = await tf.loadLayersModel('indexeddb://insurance');
  // 0 - red: many accidents
  // 1 - green: few or no accidents
  // 2 - yellow: in the middle
  model.predict(tf.tensor([[48, 100, 10]])).print();
})();