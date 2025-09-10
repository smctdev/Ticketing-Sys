function isImage(link: string): boolean {
  return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(link);
}

export { isImage };
