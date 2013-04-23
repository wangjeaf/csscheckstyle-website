#/usr/bin/python
#encoding=utf-8

import os
from ckstyle.command.ConsoleCommandParser import handleFixStyleCmdArgs, handleCkStyleCmdArgs, handleCompressCmdArgs
import sys
import json
from time import sleep
import shutil

def realpath(path, ext=''):
    return os.path.realpath(os.path.join(path, ext))

def exists(path):
    return os.path.exists(path)

def doConsume():
    taskPath = realpath(__file__, '../cache/task')
    if not os.path.exists(taskPath):
        return
    files = listAllTaskFiles(taskPath)
    if len(files) == 0:
        return
    files = sorted(files)
    for f in files:
        handleFileRequest(f, realpath(taskPath, f))

def listAllTaskFiles(taskPath):
    files = []
    for f in os.listdir(taskPath):
        if os.path.isdir(realpath(taskPath, f)):
            files.append(f)
    return files

def handleFileRequest(origin, f):
    configFile = realpath(f, 'task.json')
    if not exists(configFile):
        shutil.rmtree(f)
        return
    task = open(configFile, 'r').read()
    task = task.replace('  ', ' ');
    data = json.loads(task)
    command = data.get('command')
    
    tasks = command.split(' ')
    cssfile = realpath(__file__, tasks[-1])
    tasks[-1] = cssfile
    resultDir = realpath(__file__, '../cache/result/')
    targetFileDir = realpath(__file__, '../cache/result/' + origin)

    if not exists(resultDir):
        os.mkdir(resultDir)
    if not exists(targetFileDir):
        os.mkdir(targetFileDir)
    print 'handling %s' % f
    targetFile = realpath(targetFileDir, 'result.css')
    if tasks[1] == 'check':
        doCheck(tasks, targetFile)
    elif tasks[1] == 'fix':
        doFix(tasks, targetFile)
    elif tasks[1] == 'compress':
        configFile = realpath(f, 'yui.json')
        if exists(configFile):
            src = cssfile
            target = realpath(targetFileDir, 'result-yui.css')
            yuiCompress(src, target)
        doCompress(tasks, targetFile)
    shutil.rmtree(f)

def doCheck(args, target):
    return doCkstyle(args, handleCkStyleCmdArgs, target)
def doFix(args, target):
    return doCkstyle(args, handleFixStyleCmdArgs, target)
def doCompress(args, target):
    return doCkstyle(args, handleCompressCmdArgs, target)

def yuiCompress(src, target):
    os.popen('java -jar ./handler/yuicompressor-2.4.7.jar %s -o %s --charset utf-8 ' % (src, target))

def doCkstyle(args, handler, target):
    old = sys.stdout
    output = realpath(target)
    sys.stdout = open(output, 'w')
    handler(args)
    sys.stdout = old

    #result = open(output, 'r').read()
    #os.remove(output)
    #return result.strip()

def clean():
    taskDir = realpath(__file__, '../cache/task')
    if exists(taskDir):
        shutil.rmtree(taskDir)
    resultDir = realpath(__file__, '../cache/result')
    if exists(resultDir):
        shutil.rmtree(resultDir)

if __name__ == '__main__':
    clean()
    while True:
        sleep(2)
        try:
            doConsume()
        except Exception as e:
            print(str(e))