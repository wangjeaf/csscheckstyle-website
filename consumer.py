#/usr/bin/python
#encoding=utf-8

import os
from ckstyle.command.ConsoleCommandParser import handleFixStyleCmdArgs, handleCkStyleCmdArgs, handleCompressCmdArgs
import sys
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
		res = handleFileRequest(f, realpath(taskPath, f))

def listAllTaskFiles(taskPath):
	files = []
	for f in os.listdir(taskPath):
		if os.path.isdir(realpath(taskPath, f)):
			files.append(f)
	return files

def handleFileRequest(origin, f):
	configFile = realpath(f, 'task.json');
	if not exists(configFile):
		shutil.rmtree(f)
		return
	task = open(configFile, 'r').read()
	task = task.replace('  ', ' ');
	tasks = task.split(' ')
	cssfile = realpath(__file__, tasks[-1])
	tasks[-1] = cssfile
	targetFileDir = realpath(__file__, '../cache/result/' + origin)

	if not exists(realpath(__file__, '../cache/result/')):
		os.mkdir(realpath(__file__, '../cache/result/'))
	if not exists(realpath(__file__, '../cache/result/' + origin)):
		os.mkdir(realpath(__file__, '../cache/result/' + origin))
	print 'handling %s' % f
	targetFile = realpath(targetFileDir, 'result.css')
	if tasks[1] == 'check':
		doCheck(tasks, targetFile)
	elif tasks[1] == 'fix':
		doFix(tasks, targetFile)
	elif tasks[1] == 'compress':
		doCompress(tasks, targetFile)
	shutil.rmtree(f)

def doCheck(args, target):
    return doCkstyle(args, handleCkStyleCmdArgs, target)
def doFix(args, target):
    return doCkstyle(args, handleFixStyleCmdArgs, target)
def doCompress(args, target):
    return doCkstyle(args, handleCompressCmdArgs, target)

def doCkstyle(args, handler, target):
    old = sys.stdout
    output = realpath(target)
    sys.stdout = open(output, 'w')
    handler(args)
    sys.stdout = old

    #result = open(output, 'r').read()
    #os.remove(output)
    #return result.strip()


if __name__ == '__main__':
	while True:
		sleep(2)
		try:
			doConsume()
		except Exception as e:
			print(str(e))