const { loadOptions, saveOptions } = require("../options");
const semver = require("semver");

let sessionCached;

module.exports = async function getVersions() {
  if (sessionCached) {
    return sessionCached;
  }

  let latest;
  const local = require(`../../package.json`).version;
  const { latestVersion = local, lastChecked = 0 } = loadOptions();
  const cached = latestVersion;
  const daysPassed = (Date.now() - lastChecked) / (60 * 60 * 1000 * 24);
  if (daysPassed > 1) {
    // 如果我们一天内灭有检查版本，等待检查完成
    latest = await getAndCacheLatestVersion(cached);
  } else {
    // 否则，那么久后台进行检查更新，如果版本改变了，那么在下次就会被使用
    getAndCacheLatestVersion(cached);

    latest = cached;
  }
  return (sessionCached = {
    current: local,
    latest,
  });
};

// 拿到最新版本并保存到本地
async function getAndCacheLatestVersion(cached) {
  const getPackageVersion = require("./getPackageVersion");
  const res = await getPackageVersion("vue-cli-version-marker", "latest");
  if ((res.statusCode = 200)) {
    const { version } = res.body;
    if (semver.valid(version) && version !== cached) {
      saveOptions({
        latestVersion: version,
        lastChecked: Date.now(),
      });
      return version;
    }
  }
  return cached;
}
