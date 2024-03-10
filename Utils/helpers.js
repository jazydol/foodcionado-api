const crypto = require('crypto');

exports.generateUniqueImageName = (category, userId, fileExtension) => {
  const hash = crypto.createHash('sha256'); // You can choose a different hashing algorithm
  const hashedUserId = hash.update(userId.toString()).digest('hex');
  const timestamp = Date.now();
  return `${category}-${hashedUserId}_${timestamp}.${fileExtension}`;
};

exports.generateUniqueAwsImageName = (
  folderName,
  originalName,
  fileExtension,
) => {
  const hash = crypto.createHash('sha256'); // You can choose a different hashing algorithm
  const hashedUserId = hash.update(originalName.toString()).digest('hex');
  const timestamp = Date.now();
  return `${folderName}/${hashedUserId}_${timestamp}.${fileExtension}`;
};
