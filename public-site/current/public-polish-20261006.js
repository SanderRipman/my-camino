(() => {
  'use strict';

  const page=(location.pathname.split('/').filter(Boolean).pop()||'index.html').replace('.html','');

  function pageKey(link){
    try{
      const path=new URL(link.href,location.href).pathname;
      return (path.split('/').filter(Boolean).pop()||'index').replace(/\.html$/,'');
    }catch{return''}
  }

  function polishNavigation(){
    document.querySelectorAll('.desktop-nav,.mobile-nav').forEach(nav=>{
      [...nav.querySelectorAll('a.nav-link')].forEach(link=>{
        if(pageKey(link)==='via')link.remove();
      });
    });

    document.querySelectorAll('.workspace-link,.mobile-workspace-link').forEach(link=>{
      link.textContent='Portal';
      link.setAttribute('aria-label','Åpne AidMe Portal');
      link.title='AidMe Portal';
    });
  }

  function selectContactTrack(kind){
    const wrap=document.getElementById('deltaker-interesse');
    const form=wrap?.querySelector('form.n1-interest-form');
    const select=form?.querySelector('[name="inquiry_type"]');
    if(select){
      const wanted=kind==='partner'?'PARTNER':'PARTICIPANT';
      if([...select.options].some(option=>option.value===wanted)){
        select.value=wanted;
        select.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }
    const url=new URL(location.href);
    url.searchParams.set('spor',kind);
    url.searchParams.set('fra','kontakt-kort');
    url.hash='deltaker-interesse';
    history.replaceState(null,'',url);
    wrap?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  if(page==='kontakt'){
    document.addEventListener('click',event=>{
      const link=event.target.closest('a.n1-contact-choice');
      if(!link)return;
      const panel=link.closest('.panel');
      const text=(panel?.textContent||'').toLowerCase();
      const kind=/partnerdialog|partner dialogue/.test(text)?'partner':'deltaker';
      event.preventDefault();
      event.stopPropagation();
      selectContactTrack(kind);
    },true);
  }

  polishNavigation();
  for(const delay of [0,120,600,1600])setTimeout(polishNavigation,delay);
  window.addEventListener('load',polishNavigation,{once:true});
})();
