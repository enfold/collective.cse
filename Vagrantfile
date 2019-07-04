# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"
PROJECTNAME = "Google Search Engine"
VBOXNAME = "cse"
VBOXRAM = 1024

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.ssh.forward_agent = true
  config.vm.box = "ubuntu/bionic64"

  #XXX vagrant-vbguest has incompatibilities with vagrant-cachier /apt/list/...
  if Vagrant.has_plugin?("vagrant-vbguest")
      config.vbguest.auto_update = true
      config.vbguest.installer = VagrantVbguest::Installers::Ubuntu
  end

  config.vm.provider "virtualbox" do |v|
    v.name = PROJECTNAME
  end

  config.vm.define "virtualbox" do |virtualbox|

    config.vm.provision :shell, :path => "provision.sh", :args=>VBOXNAME

    config.vm.synced_folder ".", "/vagrant"
    if Vagrant.has_plugin?("vagrant-cachier")
      config.cache.scope = :box
      config.cache.enable :apt_lists
      config.cache.enable :apt
      config.cache.enable :npm
    end
    
    config.vm.network :private_network, type: "dhcp"
    config.vm.network :private_network, ip: "192.168.4.2"
    config.vm.network "forwarded_port", guest: 8080, host: 8080
  end

  config.vm.provider "virtualbox" do |v|
    v.memory = VBOXRAM
  end

  if Vagrant.has_plugin?("vagrant-triggers")
      config.trigger.before :destroy do
          # delete virtualenv leftovers
          run "rm -rf bin lib include"

          # delete buildout leftovrs
          run "rm -rf parts var eggs develop-eggs cache .mr.developer.cfg .installed.cfg local lib lib64"
      end
  end

end
