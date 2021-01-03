function camelize(str) {
  const s = str.replace(/(?:^\w|[A-Z]|\b\w)/g,
    (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()
  );
  return s.replace(/\s+/g, '');
}

export default camelize;