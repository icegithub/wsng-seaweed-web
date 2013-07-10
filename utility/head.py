#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import MySQLdb
import binascii
from datetime import *
from time import *

HOST, PORT = "69.197.146.118", 9998
# HOST, PORT = "localhost", 9998

DB_PATH         = "../db/irrigating_system.db"
MYSQL_SQL_PATH  = "../db/mysql_creater.sql"
SQL_PATH        = "../db/sqlite_creater.sql"

d_db_conn_local = {
        "HOST"      : "localhost",
        "USER"      : "root",
        "PASSWORD"  : "johnchain",
        #"DATABASE"  : "irrigating_system",
        "DATABASE"  : "smartwin_cdma",
}

d_length = {
        "LEN_DEVICE_NAME"   : 8,
        "LEN_DEVICE_NAME"   : 8,
        "LEN_PHONE_NUM"     : 11,
        "LEN_BEET"          : 20,
        "LEN_COMMAND_PACK"  : 6,
        "LEN_COMMAND"       : 2,
        "LEN_TIME"          : 6,
        "LEN_TIME_PACK"     : 9, #LEN_TIME + 3
        #"LEN_CAPTURE_DATA" : 4
        "LEN_LIGHT"         : 4, 
        "LEN_MULTY"         : 6,
        "LEN_INNER_HEAD"    : 3,
}

d_sense_type = {
        "SENSE_TYPE_LIGHT"     : '03',
        #"SENSE_TYPE_FLOWSPEED" : '04',
        #"SENSE_TYPE_TURBIDITY" : '05',
        "SENSE_TYPE_MULTY"      : '04',
}


d_command_type = {
        "CDMA_ONLINE"       :'0001',
        "UPDATE_TIME"       :'0002',
        "DATA_OK"           :'0003'
}

beet_head               = 'smartwin:'
sense_name_light        = 'light'
sense_name_flowspeed    = 'flowspeed'
sense_name_turbidity    = 'turbidity'
sense_name_temperature  = 'temperature'
d_frame = {
        "FRAME_H"            : '67',
        "FRAME_L"            : '71',
        "FRAME_TYPE_COMMAND" : '01',
        "FRAME_TYPE_DATA"    : '02',
        "DATA_TYPE_TIME"     : '01',
        "DATA_TYPE_DATA"     : '02'
}

d_return_mark = {
        "UNKNOWN_ERROR_SIGNAL"      : -1000,
        "DB_ERROR"                  : -11,
        "INDEX_ERROR"               : -10,
        "DB_STORE_OK"               : 0,

        "UNKNOWN_DATA_TYPE"         : -4,
        "UNKNOWN_COMMAND"           : -3,
        "UNKNOWN_FRAME_TYPE"        : -2,

        "CHECK_ILLEGAL_FRAME"       : -1,
        "CHECK_LEGAL_FRAME"         : 0,
        "BEET_PACK_READ_RIGHT"      : 0,

        "RECEIVE_DATA_OK"           : 1,
        "SEND_DATA_OK"              : 2,
        "RECEIVE_UPDATE_DATATIME"   : 3,
        "SEND_UPDATE_DATATIME"      : 4,
        "SEND_CDMA_ONLINE"          : 5
}

class t_insert_data():
        node_id = 3
        sensor_id = 3
        data = 3
        insert_time = ''

class t_select_history_data():
        node_id = 0
        start_time = ''
        end_time = ''

class t_select_all_history_data():
        node_id = 0

#==============================================================
# 此函数将一个字节能表示的十六进制数的ACKII字符格式化，遇到16以内的数：0～f， 格式化为‘0+x’，其他的不变
# 返回格式化后的字符串
#==============================================================
def transfor(two_char):
        temp = int(two_char)
        #if temp > 0 and temp < 16:
        if temp < 16:
                temp = hex(temp)[2:3]
                temp = '0' + temp
                #else temp >= 16 :
        else:
                temp = hex(temp)[2:4]
                #else:
                #return ''
                return temp

#==============================================================
# 此函数产生校验为
#==============================================================
def generate_check_byte(frame):
        frame = frame[4:]
        frame_len = len(frame)
        result = 0
        try:
                i  = 0
                while i < frame_len:
                        result ^= int(frame[i : i + 2], 16)
                        i += 2
                except IndexError as index_error:
                        print index_error
                        return d_return_mark["INDEX_ERROR"]
                else:
                        if result < 16:
                                result = hex(result)
                                result = '0' + result[2:]
                        else:
                                result = hex(result)
                                result = result[2:4]
                                return result

if __name__ == '__main__':
        pass

d_sensor_id = {
        "LIGHT"      : 101,
        "TEMPERATURE" : 102,
        "FLOWSPEED"  : 103,
        "HUMIDITY" : 104,
}
