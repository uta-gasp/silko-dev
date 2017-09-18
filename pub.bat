call npm run build
git checkout -b gh-pages
robocopy ./dist ./ /S /NFL /NDL /NC
printf "/*\n!index.html\n!404.html\n!/static\n" > .gitignore
git rm --cached -r --ignore-unmatch */* .??* *.??*
git add --all
git commit -m "update"
git push origin gh-pages --force
git checkout master
git branch -D gh-pages
