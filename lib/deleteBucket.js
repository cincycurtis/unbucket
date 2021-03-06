const _ = require('underscore');
const Series = require('run-series');

module.exports = function (client, params, done) {
  var opts = _.pick(params, 'Bucket');

  client.listObjects(opts, function (err, res) {
    var deleteParams;
    var bucketObjectsKeys = [];
    if (err) return done(err, null);

    res.Contents.forEach(function (elem) {
      bucketObjectsKeys.push(_.pick(elem, 'Key'));
    });

    deleteParams = {
      Bucket: opts.Bucket,
      Delete: {
        Objects: bucketObjectsKeys
      }
    };

    Series([
      function (next) {
        if (!bucketObjectsKeys.length) return next();
        client.deleteObjects(deleteParams, next);
      },
      function (next) {
        client.deleteBucket(opts, next);
      }
    ], done);
  });
};