// let  checkInclusion = function(s1, s2) {
//   let n1 = s1.length,n2 = s2.length;
//   const count = new Array(26).fill(0);
//   const isAllZero = (count) => count.every( val => val === 0);
//   for(let i = 0; i < n1; i++){
//       count[s1[i].charCodeAt() - 97]++;
//       count[s2[i].charCodeAt() - 97]--;
//   }
//   if(isAllZero(count)) return true;
//   for(let i = n1;i < n2;i++) {
//       count[s2[i].charCodeAt() - 97]--;
//       count[s2[i - n1].charCodeAt() - 97]++;
//       if(isAllZero(count)) return true;
//   }
//   return false;
// };

// function bubbleSort(arr) {
//   const len = arr.length;
//   for (let i = 0; i < arr.length; i++) {
//     for (let j = 0; j < len - i - 1; j++) {

//     }
//   }
// }

// function selectionSort(arr) {
//   const len = arr.length;
//   let minIndex;
//   for (let i = 0; i < len; i++) {
//     minIndex = i;
//     for (let j = i + 1; j < len; j++) {
//       if (arr[minIndex] > arr[j]) {
//         minIndex = j;
//       }
//     }
//     [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
//   }
//   return arr;
// }

// function insertionSort(arr) {
//   const len = arr.length;
//   let preIndex;
//   let current;
//   for(let i = 1; i < len; i++) {
//     preIndex = i - 1;
//     current = arr[i];
//     // 大于新元素，往后移动
//     while(preIndex >= 0 && arr[preIndex] > current) {
//       arr[preIndex + 1] = arr[preIndex];
//       preIndex--;
//     }
//     arr[preIndex + 1] = current;
//   }
//   return arr;
// }

function partition(arr, low, high) {
  let i = low - 1;
  const pivot = arr[high];
  for (let j = i; i < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[j], arr[i]] = [arr[i], arr[j]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

function quickSort(arr, low, high) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function mergeSort(arr) {
  const len = arr.length;
  if (arr.length > 1) {
    const mid = Math.floor(len / 2);
    const L = arr.slice(0, mid);
    const R = arr.slice(mid, len);

    let i = 0;
    let j = 0;
    let k = 0;

    mergeSort(L);
    mergeSort(R);

    while (i < L.length && j < R.length) {
      if (L[i] < R[j]) {
        arr[k] = L[i];
        i++;
      } else {
        arr[k] = R[j];
        j++;
      }
      k++;
    }

    // 检查是否有剩余项
    while (i < L.length) {
      arr[k] = L[i];
      i++;
      k++;
    }

    while (j < R.length) {
      arr[k] = R[j];
      j++;
      k++;
    }
  }
  return arr;
}

// function mergeSort(arr) {
//   const len = arr.length;
//   if (len === 1) {
//     return arr;
//   }

//   const mid = Math.floor(len / 2);

//   const left = arr.slice(0, mid);
//   const right = arr.slice(mid, len);

//   return merge(mergeSort(left), mergeSort(right));

// }

// function merge(left, right) {
//   const res = [];
//   let i = 0;
//   let j = 0;

//   while (i < left.length && j < right.length) {
//     if (left[i] < right[j]) {
//       res.push(left[i]);
//       i++;
//     } else {
//       res.push(right[j]);
//       j++;
//     }
//   }

//   while (i < left.length) {
//     res.push(left[i]);
//     i++;
//   }

//   while (j < right.length) {
//     res.push(right[j]);
//     j++;
//   }

//   return res;
// }

function shellSort(arr) {
  const len = arr.length;
  let gap = Math.floor(len / 2);

  while (gap > 0) {
    for (let i = gap; i < len; i++) {
      const temp = arr[i];

      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
    gap = Math.floor(gap / 2);
  }
  return arr;
}

console.log(shellSort([200, 9, -3, 5, 2, 100, 6, 8, -6, 1, 3, 300]));

// console.log(checkInclusion('ab', 'eidbaooo'))
