export function random(x) {
  return Math.floor(Math.random() * x) + 1;
}

export function randomMinMax(min, max) {
  return random(max - min + 1) + min;
}

export function randomArray(arr) {
  return arr[random(arr.length) - 1];
}

export function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
