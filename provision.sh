#!/bin/bash

export LC_ALL="en_US.UTF-8"
DEBIAN_FRONTEND=noninteractive
swapsize=1024

echo $1 > /etc/hostname

grep -q "swapfile" /etc/fstab
if [ $? -ne 0 ]; then
    echo 'swapfile not found. Adding swapfile.'
    fallocate -l ${swapsize}M /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap defaults 0 0' >> /etc/fstab
else
    echo 'swapfile found. No changes made.'
fi

if [ ! -f "/home/vagrant/.pypirc" ]; then
    echo "Creating ~/.pypirc"
    cat <<'EOF' > /home/vagrant/.pypirc
[distutils]
index-servers =
    pypicloud

[pypicloud]
repository: https://pypi.enfoldsystems.com/pypi
username: <username>
password: <password>
EOF
fi

if [ ! -d "/home/vagrant/.buildout" ]; then
    echo "Creating ~/.buildout/default.cfg"
    mkdir -p /home/vagrant/.buildout
    cat <<'EOF' > /home/vagrant/.buildout/default.cfg
[buildout]
download-cache = /opt/plone/downloads
extends-cache = /opt/plone/downloads/extends
EOF
fi

echo "apt-get update & install system packages"
apt-get -qq update
apt-get install -yq python3.7 python3.7-dev python3.7-venv python3-pip \
    python3-magic python3-tk libncurses5-dev libjpeg-dev libneon27-dev \
    libreadline-dev libz-dev libxslt-dev libxml2-dev libssl-dev git \
    libyaml-dev subversion wget curl tmux zip

# Install NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm install node

echo "Installing less, grunt, grunt-cli, brower"
npm --silent install -g less grunt grunt-cli bower

mkdir -p /opt/plone/var
mkdir -p /opt/plone/downloads/extends

if [ ! -d "/opt/plone/downloads/dist" ]; then
   echo "/opt/plone/downloads/dist not found."
   mkdir -p /opt/plone/downloads/dist
fi

if [ ! -d "/opt/plone/eggs" ]; then
   echo "/opt/plone/eggs not found."
   mkdir -p /opt/plone/eggs
fi

echo "export LC_ALL=\"en_US.UTF-8\"" >> /home/vagrant/.bashrc

chown -R vagrant.vagrant /home/vagrant
chown -R vagrant.vagrant /opt/plone


echo "Finished. Reload Vagrant and Buildout."
echo "host% vagrant reload"
echo "host% vagrant ssh"
echo "cd /vagrant"
echo "python3.7 -m venv ."
echo "./bin/pip install -r requirements.txt"
echo "./bin/buildout -Nc vagrant.cfg"

