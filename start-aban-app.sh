#!/bin/bash
cd /home/maundu/Documents/PROJECTS/aban-tech-centre-business-management-app
xfce4-terminal --hold --title="Backend" --command="yarn json-server --watch db.json --port 5000"
xfce4-terminal --hold --title="Frontend" --command="yarn start"