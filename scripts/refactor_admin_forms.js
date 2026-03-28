const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fileList = walk(filePath, fileList);
    } else if (filePath.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const targetDir = path.resolve(__dirname, '../src/app/administrador');
const allHtmlFiles = walk(targetDir);

let filesModified = 0;

for (const file of allHtmlFiles) {
  // Ignorar el admin-header
  if (file.includes('admin-header.component.html')) continue;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Add center constraints to "admin-container" or root div
  if (file.includes('\\sitio\\') || file.includes('/sitio/')) {
    content = content.replace(
      /class="admin-container(.*?)"/g, 
      'class="admin-container w-full max-w-4xl mx-auto p-4 md:p-8 animate-slide-up transition-all duration-300 min-h-[calc(100vh-80px)]$1"'
    );
  } else {
    content = content.replace(
      /class="admin-container(.*?)"/g, 
      'class="admin-container w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in transition-all duration-300 min-h-[calc(100vh-80px)]$1"'
    );
  }

  // 2. Wrap <h2> Gestions in nicer UI
  content = content.replace(
    /<h2>(.*?)<\/h2>/g,
    '<div class="mb-8 border-b border-[#e2dcd6] dark:border-[#333333] pb-4"><h2 class="text-3xl font-bold text-[#2C2C2C] dark:text-[#F0F0F0]">$1</h2></div>'
  );

  // 3. Improve <div class="header-section">
  content = content.replace(
    /<div class="header-section">/g,
    '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-[#e2dcd6] dark:border-[#333333] pb-4 gap-4">'
  );

  // 4. Update the "actions" div for forms
  content = content.replace(
    /<div class="actions">([\s\S]*?)<\/div>/g,
    function(match, p1) {
      return `<div class="flex justify-end gap-3 mt-8 pt-6 border-t border-[#e2dcd6] dark:border-[#333333]">\n${p1}\n</div>`;
    }
  );

  // 5. Upgrade generic buttons inside forms (Guardar Cambios buttons)
  content = content.replace(
    /<button mat-raised-button color="primary"(.*?)>([\s\S]*?)<\/button>/g,
    `<button mat-raised-button color="primary" class="!rounded-xl !py-2 !px-6 hover:scale-[1.02] active:scale-95 transition-transform duration-300 shadow-lg shadow-[#D4AF37]/20"$1>$2</button>`
  );

  // Upgrade 'Cancelar' styled buttons
  content = content.replace(
    /<button mat-stroked-button(.*?)>([\s\S]*?)<\/button>/g,
    `<button mat-stroked-button class="!rounded-xl !py-2 !px-6 hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors duration-300"$1>$2</button>`
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    filesModified++;
  }
}

console.log(`Refactored ${filesModified} HTML form files in Administrador module.`);
