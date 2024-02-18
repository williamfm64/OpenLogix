import subprocess
import sys
from ipaddress import IPv4Interface

def configure_static_ip(ip_address):
    interface_name = "eth0"  # Nome da interface de rede, altere se necessário
    
    # Calcula o gateway baseado no endereço IP fornecido
    gateway = IPv4Interface(f"{ip_address}/24").network.network_address + 1

    netplan_config = f"""
    network:
      version: 2
      renderer: networkd
      ethernets:
        {interface_name}:
          addresses:
            - {ip_address}/24
          gateway4: {gateway}
          nameservers:
            addresses: [8.8.8.8, 8.8.4.4]
    """

    # Escreve a configuração em um arquivo temporário
    temp_file = "/tmp/temp_netplan.yaml"
    with open(temp_file, "w") as file:
        file.write(netplan_config)

    try:
        # Aplica as configurações de rede usando netplan
        subprocess.run(["sudo", "cp", temp_file, "/etc/netplan/50-cloud-init.yaml"], check=True)
        subprocess.run(["sudo", "netplan", "apply"], check=True)
        print(f"Endereço IP configurado para {ip_address}")
    except subprocess.CalledProcessError as e:
        print(f"Ocorreu um erro ao configurar o endereço IP: {e}")
    finally:
        # Remove o arquivo temporário
        subprocess.run(["rm", temp_file])

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python configure_ip.py <endereço_ip>")
        sys.exit(1)

    ip_address = sys.argv[1]
    configure_static_ip(ip_address)
