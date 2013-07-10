#!/usr/bin/env python
# -*- coding: UTF-8 -*-
from head import *

class db_operator(object):
    def db_connect(self):
        d_db_conn = d_db_conn_local
        self.handler = MySQLdb.connect(d_db_conn["HOST"], d_db_conn["USER"], d_db_conn["PASSWORD"], d_db_conn["DATABASE"])

        self.select_cur = self.handler.cursor()
        self.update_cur = self.handler.cursor()
        self.insert_cur = self.handler.cursor()
        return self.handler, self.select_cur, self.update_cur, self.insert_cur

    def db_init(self):
        #try:
        if 1:
            for line in open(MYSQL_SQL_PATH):
                #self.update_cur.execute(line)
            #self.handler.commit()
                print "^^^^^^^^^^^^^^^^^"
                print line
        #except sqlite3.OperationalError, e:
            #print e

    ###################################################################
    def db_insert_data(self, data):
        ''' data:
                node_id
                sensor_id
                data
        '''
        now_time = datetime.now().strftime("%Y%m%d%H%M%S")
        sql_str = r'''
                    insert into tb_history_data( insert_time, node_id, sensor_id, data) values('%s', %d, %d, %f)
                ''' % (data.insert_time, data.node_id, data.sensor_id, data.data)
        self.insert_cur.execute( sql_str)
        self.handler.commit()

    def store_data(self, insert_data):
        try:
            print 'STORING: node_id = %d | sensor_id = %d | insert_time = %s | data = %.2f' %(insert_data.node_id, insert_data.sensor_id, insert_data.insert_time, insert_data.data)
            self.db_insert_data(insert_data)
            print '%d data storing is commited' %insert_data.sensor_id + 'committed'
            return d_return_mark["DB_STORE_OK"]
        except MySQLdb.Error, e:
            print "Error %d: %s" % (e.args[0], e.args[1])
            return d_return_mark["DB_ERROR"]
        else:
            print 'Finded a unknown error when storing record'
            return d_return_mark["UNKNOWN_ERROR_SIGNAL"]
 

    def db_select_realtime_data(self, data):
        ''' data:
                node_id
        '''
        str_sql = r'''
                    select node_id, sensor_id, data, insert_time from tb_realtime_data
                        where node_id = %d
                '''%(data.node_id)
        result = self.select_cur.execute(str_sql)
        return self.select_cur

    def db_select_history_data(self, data):
        ''' data:
                 node_id
                 start_time
                 end_time
         '''
        str_sql = r'''
                     select node_id, sensor_id, data, insert_time from tb_history_data
                     where node_id = %d and insert_time >= '%s' and insert_time <= '%s'
                 ''' % (data.node_id, data.start_time, data.end_time)
        result = self.select_cur.execute(str_sql)
        return self.select_cur

    def db_select_history_data_sensor(self, data):
        ''' data:
                 node_id
                 sensor_id
                 start_time
                 end_time
         '''
        str_sql = r'''
                     select node_id, sensor_id, data, insert_time from tb_history_data
                     where node_id = %d and sensor_id = %d and insert_time >= '%s' and insert_time <= '%s'
                 ''' % (data.node_id,data.sensor_id, data.start_time, data.end_time)
        result = self.select_cur.execute(str_sql)
        return self.select_cur

    def db_select_all_history_data(self, condition):
        ''' condition:
                node_id
        '''
        str_sql = r'''
                     select node_id, sensor_id, data, insert_time from tb_history_data
                         where node_id = %d
                         order by insert_time
                 '''% (condition.node_id)
        result = self.select_cur.execute(str_sql )
        return self.select_cur

    def db_select_node_sensor(self, node_id):
        str_sql = r'''
                    select sensor_id from tb_realtime_data
                    where node_id = %d
                    '''
        result = self.select_cur.execute(str_sql, [node_id])
        return self.select_cur

    def db_select_node(self):
        str_sql = r'''
                    select distinct(node_id) from tb_realtime_data
                    '''
        result = self.select_cur.execute(str_sql)
        return self.select_cur

    ###################################################################
    def db_close(self):
        if self.handler:
            self.select_cur.close()
            self.insert_cur.close()
            self.update_cur.close()
            self.handler.close()

    ###################################################################
#######################
db_op = db_operator()
#######################

def main():
    ############################ Testing Data #######################################
    command_time = datetime.now().strftime("%Y%m%d%H%M%S")
   
    insert_data = t_insert_data()
    insert_data.node_id     = 3
    insert_data.sensor_id   = d_sensor_id["LIGHT"]
    insert_data.data        = 3
   
    select_history_data = t_select_history_data()
    select_history_data.node_id     = 1
    select_history_data.start_time  = '20130605102821'
    select_history_data.end_time    = command_time
   
    select_all_history_data                 = t_select_all_history_data()
    select_all_history_data.node_id         = 1

    ################################################################################

    db = db_operator()
    db.db_connect()
    db.select_cur.execute("select version()")
    vers = db.select_cur.fetchone()
    print "database version is: %s" %vers

    try:

        result1 = db.db_select_history_data(select_history_data)
        print 'history  data: %r' % (list(result1.fetchall()))

        result7 = db.db_select_all_history_data(select_all_history_data)
        print 'all history data: %r' %str(list(result7.fetchall()))
        result8 = db.db_select_node()
        print "select all node: %r" % str(list(result8.fetchall()))

        print '%r' %command_time
    finally:
        db.db_close()

if __name__ == '__main__':
    main()

