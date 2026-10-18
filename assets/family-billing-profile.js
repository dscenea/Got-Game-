(function(){
 'use strict';
 const repo=GGBilling.createRepository(localStorage),club='Club Deportivo Horizonte';
 const fields=document.createElement('div');fields.id='familyPaymentFields';fields.hidden=true;
 fields.innerHTML='<label for="regFamilyName">Nombre y apellidos del familiar</label><input id="regFamilyName" maxlength="80" autocomplete="name" placeholder="Tu nombre y apellidos"><label for="regFamilyMethod">Forma de pago preferida (opcional)</label><select id="regFamilyMethod"></select><p class="register-help">Elige cómo prefieres pagar las cuotas. Coordinación podrá modificar esta preferencia después. Tarjeta, Apple Pay, Google Pay y domiciliación requieren conectar un proveedor; esta selección no realiza cobros. Perfil local de demostración, sin acceso a datos de menores.</p>';
 document.getElementById('linkedFields').append(fields);
 function options(select,saved){const state=repo.get(club);select.replaceChildren(new Option('Elegir más adelante',''));Object.entries(GGBilling.methods).forEach(([id,label])=>{const option=new Option(label+(state.enabled.includes(id)?'':' · No habilitado por el club'),id);option.disabled=!state.enabled.includes(id);select.add(option)});select.value=saved||''}
 const pick=pickRole;pickRole=function(role){document.getElementById('familyOwnBilling')?.remove();pick(role);fields.hidden=roleKey(role)!=='parent';if(!fields.hidden){const email=document.getElementById('regEmail').value.trim().toLowerCase(),state=repo.get(club),profile=state.profiles[email];document.getElementById('regFamilyName').value=profile?.name||'';options(document.getElementById('regFamilyMethod'),profile?state.payers[profile.name]?.method:'')}};
 function input(){return {name:document.getElementById('regFamilyName').value,method:document.getElementById('regFamilyMethod').value}}
 function validate(){if(document.getElementById('inviteCode').value.trim()!=='GG-DEMO26')throw Error('Este prototipo solo reconoce el código GG-DEMO26. No se ha asociado tu perfil a otro club.');if(!input().name.trim())throw Error('Escribe el nombre y apellidos del familiar.');if(!document.getElementById('regEmail').validity.valid)throw Error('Introduce un correo válido.');}
 function error(message){const msg=document.getElementById('registerMsg');msg.textContent=message;msg.style.display='block';go('registerScreen')}
 const complete=completeRegistration;completeRegistration=function(){if(roleKey(selectedRole)==='parent')try{validate()}catch(e){error(e.message);return}complete()};
 const submit=submitLinkRequest;submitLinkRequest=function(){if(roleKey(selectedRole)!=='parent'){submit();return}try{
  validate();const owner=document.getElementById('regEmail').value.trim().toLowerCase(),actor={role:'parent',email:owner};
  if(['Laura Martínez Ruiz','Javier Pérez Gil','Ana López Sáenz'].includes(input().name.trim()))throw Error('Ese nombre corresponde a una familia de demostración. Usa otro nombre para tu perfil.');
  const profile=repo.registerFamily(club,owner,input(),actor);submit();
  document.getElementById('placeholderText').textContent='Perfil familiar guardado en este dispositivo. La vinculación continúa pendiente de revisión; no concede acceso a jugadores. El envío al club todavía no está conectado.';
  document.getElementById('familyOwnBilling')?.remove();const panel=document.createElement('section');panel.id='familyOwnBilling';
  panel.innerHTML='<h2>Mi forma de pago</h2><p data-family-name></p><form><label for="ownFamilyMethod">Método preferido</label><select id="ownFamilyMethod" required></select><p>Solo se guarda la preferencia. No introduzcas números de cuenta ni de tarjeta.</p><button class="btn alt">Guardar preferencia</button><p role="status"></p></form>';
  panel.querySelector('[data-family-name]').textContent=profile.name;document.getElementById('placeholder').append(panel);const select=panel.querySelector('select');options(select,repo.get(club).payers[profile.name]?.method);
  panel.querySelector('form').onsubmit=e=>{e.preventDefault();try{repo.saveOwnMethod(club,owner,{method:select.value},actor);panel.querySelector('[role=status]').textContent='Preferencia actualizada. Coordinación verá este mismo método.'}catch(err){panel.querySelector('[role=status]').textContent=err.message}};
 }catch(e){error(e.message)}};
})();
