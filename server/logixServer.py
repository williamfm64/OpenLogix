from pylogix import PLC

comm = PLC()
comm.ConnectionSize = 504

def readTag(nomeTag, ip_clp, slot):
    comm.ProcessorSlot = int(slot)
    comm.IPAddress = ip_clp
    print(comm.IPAddress, comm.ProcessorSlot)
    for i in range(17):
            x = comm.GetModuleProperties(i)
            print(i, x)
    tags = comm.GetTagList()
    
    print(tags)
    ret = comm.Read(nomeTag)
    print(ret)
    return ret

def readMultiple(tagList, ip_clp, slot):
    comm.ProcessorSlot = int(slot)
    comm.IPAddress = ip_clp
    list = []
    ret = comm.Read(tagList)
    for r in ret:
        list.append(r.Value)
    return list