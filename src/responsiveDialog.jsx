import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

export default function ResponsiveDialog(props) {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  console.log(props.massage)

  return (
    <div className="float-left" onClick={props.onClick}>
      <button className='btn btn-sm' style={{marginRight:'5px', backgroundColor:'#264653', color:"white"}} onClick={handleClickOpen}>
        SQL
      </button>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{"SQL"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button autoFocus onClick={handleClose} className='btn btn-sm' style={{marginRight:'5px', backgroundColor:'#264653', color:"white"}}>
            Cancel
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}