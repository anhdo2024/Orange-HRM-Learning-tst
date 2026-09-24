cd /runner

./config.sh \
  --url https://github.com/OWNER/REPOSITORY \
  --token BG6VJ5Q7ZIFYC3YJT5XWAM3KQBA2W \
  --name "luke-02" \
  --labels "${RUNNER_LABEL:-luke-02}" \
  --work /runner/_work

./run.sh