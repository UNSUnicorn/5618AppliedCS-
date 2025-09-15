# 5618AppliedCS-
5618
cat \${BASE_CONFIG} \\
    <(echo -e '<ca>') \\
    \${KEY_DIR}/ca.crt \\
    <(echo -e '</ca>\\n<cert>') \\
    \${KEY_DIR}/issued/\${1}.crt \\
    <(echo -e '</cert>\\n<key>') \\
    \${KEY_DIR}/private/\${1}.key \\
    <(echo -e '</key>') \\
    > \${OUTPUT_DIR}/\${1}.ovpn

journalctl -u openvpn-server@server -e

sudo openvpn --config /etc/openvpn/server/server.conf

# 创建目录
sudo apt update
sudo apt install build-essential libpcre3-dev libssl-dev zlib1g-dev git -y

wget http://nginx.org/download/nginx-1.25.3.tar.gz
tar -zxvf nginx-1.25.3.tar.gz

git clone https://github.com/nbs-system/naxsi.git
