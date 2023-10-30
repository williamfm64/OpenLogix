from pylogix import PLC

comm = PLC()
comm.ConnectionSize = 504
comm.ProcessorSlot = 2
comm.IPAddress = '192.168.100.180'

def readTag(nomeTag):
    ret = comm.Read(nomeTag)
    return ret

def readMultiple(tagList):
    list = []
    ret = comm.Read(tagList)
    for r in ret:
        list.append(r.Value)
    return list