const fibo = (data: number): number => {
  if (data < 2) return 1;
  else {
    return fibo(data - 2) + fibo(data - 1);
  }
};
console.log(fibo(3));
