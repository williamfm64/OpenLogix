from pylogix import PLC

comm = PLC()
comm.ConnectionSize = 504
comm.ProcessorSlot = 2

def readTag(nomeTag, ip_clp):
    comm.IPAddress = ip_clp
    print(comm.IPAddress)
    ret = comm.Read(nomeTag)
    return ret

def readMultiple(tagList, ip_clp):
    print(comm.IPAddress)
    comm.IPAddress = ip_clp
    list = []
    ret = comm.Read(tagList)
    for r in ret:
        list.append(r.Value)
    return list