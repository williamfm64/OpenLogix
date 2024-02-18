import subprocess

def change_ip(new_ip):
    command = f"sudo ifconfig eth0 {new_ip}"
    try:
        subprocess.run(command, shell=True, check=True)
        print(f"Endereço IP alterado para {new_ip}")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao alterar o endereço IP: {e}")