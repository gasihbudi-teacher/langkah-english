import {progress} from './core.js';
import {t} from './i18n.js';
import {makeBackup,parseBackup} from './backup-format.mjs';
const KEY='langkah.progress.v1',DRAFT_PREFIX='langkah.draft.';
export function setupBackup(onRestored=()=>{}){
  const exportButton=document.getElementById('backup-export');
  const input=document.getElementById('backup-import');
  const importLabel=document.querySelector('[for="backup-import"]');
  const status=document.getElementById('backup-status');
  if(!exportButton||!input||!status)return;
  exportButton.addEventListener('click',()=>{
    try{
      const backup=makeBackup(localStorage,progress.read());
      const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download=`langkah-english-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
      status.textContent=t('backupSaved');
    }catch{status.textContent=t('backupFailure')}
  });
  importLabel?.setAttribute('tabindex','0');
  importLabel?.setAttribute('role','button');
  importLabel?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}});
  input.addEventListener('change',async()=>{
    const file=input.files?.[0];if(!file)return;
    try{
      if(file.size>10_000_000)throw Error('Too large');
      const incoming=parseBackup(await file.text());
      if(!confirm(t('backupConfirm')))return;
      const previous=Object.create(null);
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i);
        if(k===KEY||k?.startsWith(DRAFT_PREFIX))previous[k]=localStorage.getItem(k);
      }
      try{
        // Commit only after full validation; restore previous keys if the storage write fails.
        for(const k of Object.keys(previous))localStorage.removeItem(k);
        localStorage.setItem(KEY,JSON.stringify(incoming.progress));
        for(const [id,d] of Object.entries(incoming.drafts))localStorage.setItem(DRAFT_PREFIX+id,JSON.stringify(d));
      }catch(e){
        const remaining=[];for(let i=0;i<localStorage.length;i++)remaining.push(localStorage.key(i));
        for(const k of remaining)if(k===KEY||k.startsWith(DRAFT_PREFIX))localStorage.removeItem(k);
        for(const [k,v] of Object.entries(previous))try{localStorage.setItem(k,v)}catch{}
        throw e;
      }
      status.textContent=t('backupRestored');onRestored();
      // Reset ephemeral memory caches and refresh all pages/stats after a replacement.
      location.reload();
    }catch(err){status.textContent=err instanceof SyntaxError||/invalid|unknown|large|too many/i.test(err.message)?t('backupInvalid'):t('backupFailure')}
    finally{input.value=''}
  });
}
